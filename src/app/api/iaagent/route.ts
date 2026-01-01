import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const APIGROQ_URL = process.env.APIGROQ_URL;
const APIGROQ_KEY = process.env.APIGROQ_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

type AnyRecord = Record<string, unknown>;
type ChatMessage = { role?: string; content?: string };

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!isRecord(value)) return false;
  const role = value.role;
  const content = value.content;
  const roleOk = role == null || typeof role === 'string';
  const contentOk = content == null || typeof content === 'string';
  return roleOk && contentOk;
}

function lastUserPrompt(messages: ChatMessage[]) {
  const lastUser = [...messages]
    .reverse()
    .find((m) => m?.role === 'user' || m?.role === 'client');
  return lastUser?.content ?? '';
}

function extractReplyFromProvider(json: unknown) {
  if (!json) return null;
  if (isRecord(json) && typeof json.reply === 'string') return json.reply;
  if (isRecord(json) && Array.isArray(json.choices) && json.choices.length) {
    const first = json.choices[0];
    if (isRecord(first) && typeof first.text === 'string') return first.text;
    if (isRecord(first) && isRecord(first.message) && typeof first.message.content === 'string') return first.message.content;
  }
  if (isRecord(json) && typeof json.output === 'string') return json.output;
  if (isRecord(json) && typeof json.result === 'string') return json.result;
  try {
    return JSON.stringify(json).slice(0, 200);
  } catch {
    return null;
  }
}

const DEBUG_PATH = path.join(process.cwd(), 'tmp', 'iaagent-groq-debug.json');

async function appendDebugEntry(entry: unknown) {
  try {
    await fs.mkdir(path.dirname(DEBUG_PATH), { recursive: true });
    let arr: unknown[] = [];
    try {
      const raw = await fs.readFile(DEBUG_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) arr = parsed;
    } catch {}
    arr.push({ ts: new Date().toISOString(), entry });
    await fs.writeFile(DEBUG_PATH, JSON.stringify(arr, null, 2), 'utf-8');
  } catch {
    // ignore logging failures
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const msgs: ChatMessage[] = isRecord(body) && Array.isArray(body.messages)
      ? (body.messages as unknown[]).filter(isChatMessage)
      : [];

    // If an external APIGROQ provider is configured, forward the request
    if (APIGROQ_URL) {
      try {
        const headers: Record<string,string> = { 'Content-Type': 'application/json' };
        if (APIGROQ_KEY) headers['Authorization'] = `Bearer ${APIGROQ_KEY}`;

        // Try several payload shapes to be compatible with different providers
        const prompt = lastUserPrompt(msgs);
        const attempts = [{ messages: msgs }, { prompt }, { input: prompt }, { text: prompt }];

        let lastJson: unknown = null;
        for (const payload of attempts) {
          try {
            const resp = await fetch(APIGROQ_URL, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            });
            const json = (await resp.json().catch(() => null)) as unknown;
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

        let lastJson: unknown = null;
        let lastPayload: unknown = null;
        let lastUrl: string | null = null;
        for (const url of candidateUrls) {
          // try a few payload shapes
          const prompt = lastUserPrompt(msgs);
          const payloads = [{ input: prompt }, { prompt }, { messages: msgs }, { text: prompt }];

          for (const payload of payloads) {
            try {
              const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
              lastUrl = url;
              lastPayload = payload;
              const json = (await resp.json().catch(() => null)) as unknown;
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
        const fallbackText =
          (isRecord(lastJson) && typeof lastJson.message === 'string' ? lastJson.message : null) ||
          (typeof lastJson === 'string' ? lastJson : JSON.stringify(lastJson || {}).slice(0, 300));
        return NextResponse.json({ reply: `Erro do provedor Groq: ${String(fallbackText).slice(0,400)}` }, { status: 200 });
      } catch (err) {
        return NextResponse.json({ message: 'Erro ao conectar ao Groq provider', error: String(err) }, { status: 502 });
      }
    }

    // Fallback: no external provider configured — return informative message
    const lastUser = [...msgs].reverse().find((m) => m?.role === 'user' || m?.role === 'client');
    const prompt = lastUser?.content || (msgs.length ? String(msgs[msgs.length - 1]?.content ?? '') : '');
    const reply = prompt
      ? `Placeholder: recebi sua solicitação: "${String(prompt).slice(0, 400)}". Configure APIGROQ_URL/APIGROQ_KEY para respostas reais.`
      : 'Placeholder: envie sua ideia. Configure APIGROQ_URL/APIGROQ_KEY para respostas reais.';

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ message: 'Erro interno ao gerar resposta', error: String(err) }, { status: 500 });
  }
}
