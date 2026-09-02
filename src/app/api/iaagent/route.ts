import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { requireAuth } from '@/lib/middlewareAuth';

function normalizeCustomBaseUrl(raw?: string, defaultUrl = 'https://api.openai.com/v1') {
  if (!raw || !raw.trim()) return defaultUrl;
  let val = raw.trim().replace(/\/+$/, '');
  // Se não termina em /v1 e não tem caminho específico de endpoint, adiciona /v1
  if (!val.includes('/v1') && !val.includes('/chat/completions') && !val.includes('/generateContent')) {
    val = `${val}/v1`;
  }
  return val;
}

function buildTextMessages(messages: any[] = [], systemPrompt?: string) {
  const output: any[] = [];
  if (systemPrompt && systemPrompt.trim()) {
    output.push({ role: 'system', content: systemPrompt.trim() });
  }

  for (const m of messages) {
    if (!m || !m.role) continue;
    const role = m.role === 'agent' ? 'assistant' : m.role === 'client' ? 'user' : m.role;
    if (m.imageUrl) {
      // Provedores fora do Groq não recebem visão aqui: converte a imagem
      // em uma nota textual e NUNCA deixa a chave `imageUrl` vazar no
      // payload (alguns endpoints OpenAI-compatible rejeitam propriedades
      // desconhecidas em `messages[]`, ex: "property 'imageUrl' is unsupported").
      output.push({
        role,
        content: `${m.content || 'Imagem anexada.'} [O usuário anexou uma imagem que este provedor de IA não consegue visualizar; peça para ele descrever o conteúdo em texto.]`,
      });
      continue;
    }
    // Saneamento explícito: só role + content (string) chegam ao provedor,
    // nunca campos extras do nosso tipo interno de mensagem (ex: imageUrl,
    // id, timestamp, from).
    output.push({
      role,
      content: typeof m.content === 'string' ? m.content : String(m.content ?? ''),
    });
  }

  if (!output.length) output.push({ role: 'user', content: 'Olá' });
  return output;
}

/**
 * Chamada genérica para qualquer endpoint compatível com OpenAI
 * (OpenAI, DeepSeek, OpenRouter, Ollama, LM Studio, vLLM, FastChat, Azure, Custom)
 */
async function callOpenAiCompatible({
  messages,
  apiKey,
  model,
  systemPrompt,
  baseUrl,
  temperature = 0.7,
  maxTokens = 2048,
  topP = 1.0,
}: {
  messages: any[];
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  baseUrl: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}) {
  const url = baseUrl.endsWith('/chat/completions')
    ? baseUrl
    : `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  const payloadMessages = buildTextMessages(messages, systemPrompt);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: payloadMessages,
      temperature: Number(temperature) || 0.7,
      max_tokens: Number(maxTokens) || 2048,
      top_p: Number(topP) || 1.0,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Endpoint (${response.status} ${response.statusText}): ${text || 'Falha na resposta'}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || 'Sem resposta do modelo.';
}

async function callAnthropic({
  messages,
  apiKey,
  model,
  systemPrompt,
  temperature = 0.7,
  maxTokens = 2048,
}: {
  messages: any[];
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}) {
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
      max_tokens: Number(maxTokens) || 2048,
      temperature: Number(temperature) || 0.7,
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

async function callGoogle({
  messages,
  apiKey,
  model,
  systemPrompt,
  temperature = 0.7,
  maxTokens = 2048,
}: {
  messages: any[];
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const finalKey = apiKey || process.env.GOOGLE_API_KEY;
  if (!finalKey) throw new Error('API Key do Google Gemini não configurada.');

  const finalModel = model || process.env.GOOGLE_MODEL || 'gemini-2.0-flash';
  const contents = buildTextMessages(messages, systemPrompt).map((message: any) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(message.content ?? '') }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${finalModel}:generateContent?key=${finalKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: Number(temperature) || 0.7,
          maxOutputTokens: Number(maxTokens) || 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google falhou (${response.status}): ${text || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).join('') || 'Sem resposta do modelo.';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const {
      messages,
      apiKey,
      groqKey,
      openAiKey,
      anthropicKey,
      googleKey,
      deepseekKey,
      openRouterKey,
      customApiKey,
      model,
      groqModel,
      openAiModel,
      anthropicModel,
      googleModel,
      deepseekModel,
      openRouterModel,
      customModel,
      systemPrompt,
      provider = 'groq',
      baseUrl,
      customBaseUrl,
      temperature = 0.7,
      maxTokens = 2048,
      topP = 1.0,
      testConnection = false,
    } = body;

    // Se for teste de conexão, envia um ping rápido
    const testMessages = testConnection
      ? [{ role: 'user', content: 'Ping. Responda apenas "OK".' }]
      : Array.isArray(messages)
      ? messages
      : [{ role: 'user', content: 'Olá' }];

    // 1. Provedores OpenAI-Compatible com Custom Base URLs
    if (provider === 'custom') {
      const targetUrl = normalizeCustomBaseUrl(customBaseUrl || baseUrl, 'https://api.openai.com/v1');
      const reply = await callOpenAiCompatible({
        messages: testMessages,
        apiKey: customApiKey || apiKey,
        model: customModel || model || 'gpt-4o-mini',
        systemPrompt: testConnection ? undefined : systemPrompt,
        baseUrl: targetUrl,
        temperature,
        maxTokens: testConnection ? 50 : maxTokens,
        topP,
      });
      return NextResponse.json({ reply, latencyMs: Date.now() - startTime, ok: true, provider: 'custom' });
    }

    if (provider === 'deepseek') {
      const targetUrl = normalizeCustomBaseUrl(customBaseUrl || baseUrl, 'https://api.deepseek.com/v1');
      const reply = await callOpenAiCompatible({
        messages: testMessages,
        apiKey: deepseekKey || apiKey || process.env.DEEPSEEK_API_KEY,
        model: deepseekModel || model || 'deepseek-chat',
        systemPrompt: testConnection ? undefined : systemPrompt,
        baseUrl: targetUrl,
        temperature,
        maxTokens: testConnection ? 50 : maxTokens,
        topP,
      });
      return NextResponse.json({ reply, latencyMs: Date.now() - startTime, ok: true, provider: 'deepseek' });
    }

    if (provider === 'openrouter') {
      const targetUrl = normalizeCustomBaseUrl(customBaseUrl || baseUrl, 'https://openrouter.ai/api/v1');
      const reply = await callOpenAiCompatible({
        messages: testMessages,
        apiKey: openRouterKey || apiKey || process.env.OPENROUTER_API_KEY,
        model: openRouterModel || model || 'meta-llama/llama-3.3-70b-instruct',
        systemPrompt: testConnection ? undefined : systemPrompt,
        baseUrl: targetUrl,
        temperature,
        maxTokens: testConnection ? 50 : maxTokens,
        topP,
      });
      return NextResponse.json({ reply, latencyMs: Date.now() - startTime, ok: true, provider: 'openrouter' });
    }

    if (provider === 'ollama') {
      const targetUrl = normalizeCustomBaseUrl(customBaseUrl || baseUrl, 'http://127.0.0.1:11434/v1');
      const reply = await callOpenAiCompatible({
        messages: testMessages,
        apiKey: apiKey || 'ollama',
        model: model || 'llama3.3',
        systemPrompt: testConnection ? undefined : systemPrompt,
        baseUrl: targetUrl,
        temperature,
        maxTokens: testConnection ? 50 : maxTokens,
        topP,
      });
      return NextResponse.json({ reply, latencyMs: Date.now() - startTime, ok: true, provider: 'ollama' });
    }

    if (provider === 'lmstudio') {
      const targetUrl = normalizeCustomBaseUrl(customBaseUrl || baseUrl, 'http://127.0.0.1:1234/v1');
      const reply = await callOpenAiCompatible({
        messages: testMessages,
        apiKey: apiKey || 'lm-studio',
        model: model || 'local-model',
        systemPrompt: testConnection ? undefined : systemPrompt,
        baseUrl: targetUrl,
        temperature,
        maxTokens: testConnection ? 50 : maxTokens,
        topP,
      });
      return NextResponse.json({ reply, latencyMs: Date.now() - startTime, ok: true, provider: 'lmstudio' });
    }

    if (provider === 'openai') {
      const targetUrl = normalizeCustomBaseUrl(customBaseUrl || baseUrl, 'https://api.openai.com/v1');
      const reply = await callOpenAiCompatible({
        messages: testMessages,
        apiKey: openAiKey || apiKey || process.env.OPENAI_API_KEY,
        model: openAiModel || model || 'gpt-4o-mini',
        systemPrompt: testConnection ? undefined : systemPrompt,
        baseUrl: targetUrl,
        temperature,
        maxTokens: testConnection ? 50 : maxTokens,
        topP,
      });
      return NextResponse.json({ reply, latencyMs: Date.now() - startTime, ok: true, provider: 'openai' });
    }

    if (provider === 'anthropic') {
      const reply = await callAnthropic({
        messages: testMessages,
        apiKey: anthropicKey || apiKey,
        model: anthropicModel || model,
        systemPrompt: testConnection ? undefined : systemPrompt,
        temperature,
        maxTokens: testConnection ? 50 : maxTokens,
      });
      return NextResponse.json({ reply, latencyMs: Date.now() - startTime, ok: true, provider: 'anthropic' });
    }

    if (provider === 'google') {
      const reply = await callGoogle({
        messages: testMessages,
        apiKey: googleKey || apiKey,
        model: googleModel || model,
        systemPrompt: testConnection ? undefined : systemPrompt,
        temperature,
        maxTokens: testConnection ? 50 : maxTokens,
      });
      return NextResponse.json({ reply, latencyMs: Date.now() - startTime, ok: true, provider: 'google' });
    }

    // Default: Groq Cloud
    const finalGroqKey = groqKey || apiKey || process.env.GROQ_API_KEY;
    if (!finalGroqKey) {
      return NextResponse.json(
        {
          ok: false,
          reply:
            'Erro: API Key da Groq não configurada. Configure no seu Painel (Configurações > IA & Gateway) ou defina GROQ_API_KEY no servidor.',
        },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey: finalGroqKey });

    const groqMessages = [] as any[];
    if (!testConnection && systemPrompt && systemPrompt.trim()) {
      groqMessages.push({ role: 'system', content: systemPrompt.trim() });
    }

    let hasImage = false;

    if (testConnection) {
      groqMessages.push({ role: 'user', content: 'Ping. Responda apenas "OK".' });
    } else if (messages && Array.isArray(messages)) {
      const formattedMessages = messages.map((m: any) => {
        const role = m?.role === 'agent' ? 'assistant' : m?.role === 'client' ? 'user' : m?.role;
        if (m?.imageUrl) {
          hasImage = true;
          return {
            role,
            content: [
              { type: 'text', text: m.content || ' ' },
              { type: 'image_url', image_url: { url: m.imageUrl } },
            ],
          };
        }
        // Saneamento explícito: só role + content chegam ao SDK — nunca
        // campos extras do nosso tipo interno de mensagem (id, imageUrl:
        // undefined, timestamp, from), que o Groq rejeita como propriedade
        // desconhecida mesmo quando o valor é undefined.
        return { role, content: typeof m?.content === 'string' ? m.content : String(m?.content ?? '') };
      });
      groqMessages.push(...formattedMessages);
    } else {
      groqMessages.push({ role: 'user', content: 'Olá' });
    }

    const finalModel = hasImage
      ? 'meta-llama/llama-4-scout-17b-16e-instruct'
      : groqModel || model || 'openai/gpt-oss-120b';

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: finalModel,
      temperature: Number(temperature) || 0.7,
      max_tokens: testConnection ? 50 : Number(maxTokens) || 2048,
    });

    const reply = completion.choices[0]?.message?.content || 'Sem resposta do modelo.';

    return NextResponse.json({
      reply,
      latencyMs: Date.now() - startTime,
      ok: true,
      provider: 'groq',
      model: finalModel,
    });
  } catch (error: any) {
    console.error('Erro na API IA:', error);
    const rawMessage = String(error?.message || '');
    const isImageUnsupported = /imageUrl.*unsupported|image_url.*unsupported/i.test(rawMessage);
    const friendlyReply = isImageUnsupported
      ? 'O provedor de IA selecionado não consegue analisar imagens. Descreva o conteúdo em texto ou troque para um provedor com suporte a imagem (ex: Groq) em Configurações > IA & LLM Gateway.'
      : `Erro ao se comunicar com o provedor de IA: ${rawMessage || 'Desconhecido'}`;
    return NextResponse.json(
      {
        ok: false,
        reply: friendlyReply,
        latencyMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
