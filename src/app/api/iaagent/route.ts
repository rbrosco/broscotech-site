import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const APIGROQ_URL = process.env.APIGROQ_URL;
const APIGROQ_KEY = process.env.APIGROQ_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function extractReplyFromProvider(json: any) {
  if (!json) return null;
  if (typeof json.reply === 'string') return json.reply;
  if (json.choices && Array.isArray(json.choices) && json.choices.length) {
    const c = json.choices[0];
    return c.text || (c.message && c.message.content) || null;
  }
  if (typeof json.output === 'string') return json.output;
  if (typeof json.result === 'string') return json.result;
  // last resort: stringify a small part
  try { return JSON.stringify(json).slice(0, 200); } catch { return null; }
}

const DEBUG_PATH = path.join(process.cwd(), 'tmp', 'iaagent-groq-debug.json');

async function appendDebugEntry(entry: any) {
  try {
    await fs.mkdir(path.dirname(DEBUG_PATH), { recursive: true });
    let arr = [] as any[];
    try {
      const raw = await fs.readFile(DEBUG_PATH, 'utf-8');
      arr = JSON.parse(raw);
    } catch {}
    arr.push({ ts: new Date().toISOString(), entry });
    await fs.writeFile(DEBUG_PATH, JSON.stringify(arr, null, 2), 'utf-8');
  } catch {
    // ignore logging failures
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const msgs = Array.isArray(body?.messages) ? body.messages : [];

    // If an external APIGROQ provider is configured, forward the request
    if (APIGROQ_URL) {
      try {
        const headers: Record<string,string> = { 'Content-Type': 'application/json' };
        if (APIGROQ_KEY) headers['Authorization'] = `Bearer ${APIGROQ_KEY}`;

        // Try several payload shapes to be compatible with different providers
        const attempts = [
          { messages: msgs },
          // send only last user prompt as `prompt`
          { prompt: (msgs.length ? msgs.slice().reverse().find((m:any)=>m?.role==='user'||m?.role==='client')?.content : '') },
          { input: (msgs.length ? msgs.slice().reverse().find((m:any)=>m?.role==='user'||m?.role==='client')?.content : '') },
          { text: (msgs.length ? msgs.slice().reverse().find((m:any)=>m?.role==='user'||m?.role==='client')?.content : '') },
        ];

        let lastJson: any = null;
        for (const payload of attempts) {
          try {
            const resp = await fetch(APIGROQ_URL, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            });
            const json = await resp.json().catch(() => null);
            lastJson = json || await resp.text().catch(()=>null);
            if (!resp.ok) {
              // try next payload shape
              continue;
            }
            const reply = extractReplyFromProvider(json);
            if (reply) {
              // if debug mode, include raw json
              if (process.env.APIGROQ_DEBUG === 'true') return NextResponse.json({ reply, raw: json });
              return NextResponse.json({ reply });
            }
            // else continue to try other shapes
          } catch (e) {
            lastJson = { error: String(e) };
            continue;
          }
        }

        // nothing produced a reply
        if (process.env.APIGROQ_DEBUG === 'true') {
          return NextResponse.json({ message: 'APIGROQ provider responded but no reply extracted', details: lastJson }, { status: 502 });
        }
        return NextResponse.json({ message: 'APIGROQ provider error', details: lastJson }, { status: 502 });
      } catch (err) {
        return NextResponse.json({ message: 'Erro ao conectar ao APIGROQ provider', error: String(err) }, { status: 502 });
      }
    }

    // If a Groq API key is present, try calling Groq endpoints automatically
    if (!APIGROQ_URL && GROQ_API_KEY) {
      try {
        const headers: Record<string,string> = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` };

        const candidateUrls = [
          `https://api.groq.ai/v1/models/${encodeURIComponent(GROQ_MODEL)}/responses`,
          `https://api.groq.ai/v1/models/${encodeURIComponent(GROQ_MODEL)}/generate`,
        ];

        let lastJson: any = null;
        let lastPayload: any = null;
        let lastUrl: string | null = null;
        for (const url of candidateUrls) {
          // try a few payload shapes
          const payloads = [
            { input: msgs.length ? msgs.slice().reverse().find((m:any)=>m?.role==='user'||m?.role==='client')?.content : '' },
            { prompt: msgs.length ? msgs.slice().reverse().find((m:any)=>m?.role==='user'||m?.role==='client')?.content : '' },
            { messages: msgs },
            { text: msgs.length ? msgs.slice().reverse().find((m:any)=>m?.role==='user'||m?.role==='client')?.content : '' },
          ];

          for (const payload of payloads) {
            try {
              const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
              lastUrl = url;
              lastPayload = payload;
              const json = await resp.json().catch(() => null);
              lastJson = json || await resp.text().catch(()=>null);
              if (!resp.ok) continue;
              const reply = extractReplyFromProvider(json);
              if (reply) {
                if (process.env.APIGROQ_DEBUG === 'true') return NextResponse.json({ reply, raw: json });
                return NextResponse.json({ reply });
              }
            } catch (e) {
              lastJson = { error: String(e) };
              continue;
            }
          }
        }

        // write debug entry
        try { await appendDebugEntry({ provider: 'groq', url: lastUrl, payload: lastPayload, response: lastJson, env: { GROQ_MODEL, hasKey: !!GROQ_API_KEY } }); } catch {}

        if (process.env.APIGROQ_DEBUG === 'true') return NextResponse.json({ message: 'Groq responded but no reply extracted', details: lastJson }, { status: 502 });
        // fallback: return readable fragment so UI shows something
        const fallbackText = lastJson?.message || (typeof lastJson === 'string' ? lastJson : JSON.stringify(lastJson || {}).slice(0, 300));
        return NextResponse.json({ reply: `Erro do provedor Groq: ${String(fallbackText).slice(0,400)}` }, { status: 200 });
      } catch (err) {
        return NextResponse.json({ message: 'Erro ao conectar ao Groq provider', error: String(err) }, { status: 502 });
      }
    }

    // Fallback: no external provider configured — return informative message
    const lastUser = [...msgs].reverse().find((m: any) => m?.role === 'user' || m?.role === 'client');
    const prompt = lastUser?.content || (msgs.length ? String(msgs[msgs.length - 1]?.content ?? '') : '');
    const reply = prompt
      ? `Placeholder: recebi sua solicitação: "${String(prompt).slice(0, 400)}". Configure APIGROQ_URL/APIGROQ_KEY para respostas reais.`
      : 'Placeholder: envie sua ideia. Configure APIGROQ_URL/APIGROQ_KEY para respostas reais.';

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ message: 'Erro interno ao gerar resposta', error: String(err) }, { status: 500 });
  }
}
