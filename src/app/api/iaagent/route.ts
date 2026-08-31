import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { requireAuth } from '@/lib/middlewareAuth';

function normalizeBaseUrl(raw?: string) {
  const value = (raw || process.env.LMSTUDIO_BASE_URL || 'http://127.0.0.1:1234/v1').trim();
  // Só permite endpoints locais (loopback) para evitar SSRF: qualquer host
  // arbitrário enviado pelo cliente seria buscado pelo servidor.
  let host = '';
  try {
    host = new URL(value.endsWith('/v1') ? value : `${value.replace(/\/$/, '')}/v1`).hostname;
  } catch {
    return 'http://127.0.0.1:1234/v1';
  }
  const isLoopback = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (!isLoopback) return 'http://127.0.0.1:1234/v1';
  if (!value) return 'http://127.0.0.1:1234/v1';
  return value.endsWith('/v1') ? value : `${value.replace(/\/$/, '')}/v1`;
}

function buildTextMessages(messages: any[] = [], systemPrompt?: string) {
  const output: any[] = [];
  if (systemPrompt) output.push({ role: 'system', content: systemPrompt });

  for (const m of messages) {
    if (!m || !m.role) continue;
    if (m.imageUrl) {
      output.push({
        role: m.role,
        content: `${m.content || 'Imagem anexada.'} ${m.imageUrl ? `\n[Imagem: ${m.imageUrl}]` : ''}`,
      });
      continue;
    }
    output.push({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : String(m.content ?? ''),
    });
  }

  if (!output.length) output.push({ role: 'user', content: 'Olá' });
  return output;
}

async function callLmStudio({ messages, model, systemPrompt, baseUrl, apiKey }: { messages: any[]; model?: string; systemPrompt?: string; baseUrl?: string; apiKey?: string }) {
  const finalBaseUrl = normalizeBaseUrl(baseUrl);
  const finalModel = model || process.env.LMSTUDIO_MODEL || 'local-model';
  const payloadMessages = buildTextMessages(messages, systemPrompt);

  const response = await fetch(`${finalBaseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey || process.env.LMSTUDIO_API_KEY || 'lm-studio'}`,
    },
    body: JSON.stringify({
      model: finalModel,
      messages: payloadMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LM Studio falhou (${response.status}): ${text || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || 'Sem resposta do modelo.';
}

async function callOpenAI({ messages, apiKey, model, systemPrompt }: { messages: any[]; apiKey?: string; model?: string; systemPrompt?: string }) {
  const finalKey = apiKey || process.env.OPENAI_API_KEY;
  if (!finalKey) throw new Error('API Key da OpenAI não configurada.');

  const finalModel = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${finalKey}`,
    },
    body: JSON.stringify({
      model: finalModel,
      messages: buildTextMessages(messages, systemPrompt),
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI falhou (${response.status}): ${text || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || 'Sem resposta do modelo.';
}

async function callAnthropic({ messages, apiKey, model, systemPrompt }: { messages: any[]; apiKey?: string; model?: string; systemPrompt?: string }) {
  const finalKey = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!finalKey) throw new Error('API Key da Anthropic não configurada.');

  const finalModel = model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  const anthropicMessages = buildTextMessages(messages).filter((m: any) => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': finalKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: finalModel,
      max_tokens: 1024,
      system: systemPrompt || undefined,
      messages: anthropicMessages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic falhou (${response.status}): ${text || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  return data?.content?.[0]?.text || 'Sem resposta do modelo.';
}

async function callGoogle({ messages, apiKey, model, systemPrompt }: { messages: any[]; apiKey?: string; model?: string; systemPrompt?: string }) {
  const finalKey = apiKey || process.env.GOOGLE_API_KEY;
  if (!finalKey) throw new Error('API Key do Google não configurada.');

  const finalModel = model || process.env.GOOGLE_MODEL || 'gemini-1.5-flash';
  const contents = buildTextMessages(messages, systemPrompt).map((message: any) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(message.content ?? '') }],
  }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${finalModel}:generateContent?key=${finalKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google falhou (${response.status}): ${text || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).join('') || 'Sem resposta do modelo.';
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });

    const body = await request.json();
    const {
      messages,
      apiKey,
      groqKey,
      openAiKey,
      anthropicKey,
      googleKey,
      lmStudioApiKey,
      model,
      groqModel,
      openAiModel,
      anthropicModel,
      googleModel,
      systemPrompt,
      provider,
      baseUrl,
    } = body;

    if (provider === 'lmstudio' || baseUrl) {
      const reply = await callLmStudio({
        messages: Array.isArray(messages) ? messages : [],
        model: model || body.lmStudioModel,
        systemPrompt,
        baseUrl,
        apiKey: lmStudioApiKey,
      });
      return NextResponse.json({ reply });
    }

    if (provider === 'openai') {
      const reply = await callOpenAI({
        messages: Array.isArray(messages) ? messages : [],
        apiKey: openAiKey || apiKey,
        model: openAiModel || model,
        systemPrompt,
      });
      return NextResponse.json({ reply });
    }

    if (provider === 'anthropic') {
      const reply = await callAnthropic({
        messages: Array.isArray(messages) ? messages : [],
        apiKey: anthropicKey || apiKey,
        model: anthropicModel || model,
        systemPrompt,
      });
      return NextResponse.json({ reply });
    }

    if (provider === 'google') {
      const reply = await callGoogle({
        messages: Array.isArray(messages) ? messages : [],
        apiKey: googleKey || apiKey,
        model: googleModel || model,
        systemPrompt,
      });
      return NextResponse.json({ reply });
    }

    const finalGroqKey = groqKey || apiKey || process.env.GROQ_API_KEY;
    if (!finalGroqKey) {
      return NextResponse.json(
        { reply: 'Erro: API Key da Groq não configurada. Configure no seu Painel (Configurações > IA Agent) ou defina GROQ_API_KEY no servidor.' },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey: finalGroqKey });

    const groqMessages = [] as any[];
    if (systemPrompt) {
      groqMessages.push({ role: 'system', content: systemPrompt });
    }

    let hasImage = false;

    if (messages && Array.isArray(messages)) {
      const formattedMessages = messages.map((m: any) => {
        if (m.imageUrl) {
          hasImage = true;
          return {
            role: m.role,
            content: [
              { type: 'text', text: m.content || ' ' },
              { type: 'image_url', image_url: { url: m.imageUrl } }
            ]
          };
        }
        return m;
      });
      groqMessages.push(...formattedMessages);
    } else {
      groqMessages.push({ role: 'user', content: 'Olá' });
    }

    const finalModel = hasImage ? 'llama-3.2-11b-vision-preview' : (groqModel || model || 'llama-3.3-70b-versatile');

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: finalModel,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'Sem resposta do modelo.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Erro na API IA:', error);
    return NextResponse.json(
      { reply: `Erro ao se comunicar com a IA: ${error?.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}
