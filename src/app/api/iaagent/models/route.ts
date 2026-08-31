import { NextRequest, NextResponse } from 'next/server';

function normalizeCustomBaseUrl(raw?: string, defaultUrl = 'https://api.openai.com/v1') {
  if (!raw || !raw.trim()) return defaultUrl;
  let val = raw.trim().replace(/\/+$/, '');
  if (!val.includes('/v1') && !val.includes('/chat/completions') && !val.includes('/models')) {
    val = `${val}/v1`;
  }
  return val;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider = 'groq', baseUrl, customBaseUrl, apiKey } = body;

    let models: string[] = [];

    // 1. Google Gemini
    if (provider === 'google') {
      const finalKey = apiKey || process.env.GOOGLE_API_KEY;
      if (!finalKey) {
        return NextResponse.json({ ok: false, message: 'API Key do Google não informada.' }, { status: 400 });
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${finalKey}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google (${res.status}): ${errText || res.statusText}`);
      }

      const data = await res.json();
      models = (data.models || [])
        .map((m: any) => m.name?.replace('models/', ''))
        .filter((name: string) => name && !name.includes('embedding') && !name.includes('aqa'));
      return NextResponse.json({ ok: true, models });
    }

    // 2. Anthropic Claude
    if (provider === 'anthropic') {
      const finalKey = apiKey || process.env.ANTHROPIC_API_KEY;
      if (!finalKey) {
        return NextResponse.json({ ok: false, message: 'API Key da Anthropic não informada.' }, { status: 400 });
      }

      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': finalKey,
          'anthropic-version': '2023-06-01',
        },
      });

      if (!res.ok) {
        // Fallback para modelos conhecidos se a chave não tiver permissão de listagem
        return NextResponse.json({
          ok: true,
          models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
        });
      }

      const data = await res.json();
      models = (data.data || []).map((m: any) => m.id);
      return NextResponse.json({ ok: true, models });
    }

    // 3. Ollama
    if (provider === 'ollama') {
      const targetBase = (customBaseUrl || baseUrl || 'http://127.0.0.1:11434').replace(/\/v1\/?$/, '').replace(/\/+$/, '');
      try {
        // Tenta endpoint nativo /api/tags
        const res = await fetch(`${targetBase}/api/tags`);
        if (res.ok) {
          const data = await res.json();
          models = (data.models || []).map((m: any) => m.name || m.model);
          if (models.length) return NextResponse.json({ ok: true, models });
        }
      } catch {}

      // Fallback para /v1/models
      try {
        const res2 = await fetch(`${targetBase}/v1/models`);
        if (res2.ok) {
          const data2 = await res2.json();
          models = (data2.data || []).map((m: any) => m.id);
          if (models.length) return NextResponse.json({ ok: true, models });
        }
      } catch {}

      throw new Error(`Não foi possível conectar ao Ollama em ${targetBase}. Verifique se o servidor está rodando.`);
    }

    // 4. OpenAI & Provedores Compatíveis (OpenAI, DeepSeek, OpenRouter, Groq, LM Studio, Custom)
    let targetUrl = '';
    if (provider === 'groq') {
      targetUrl = 'https://api.groq.com/openai/v1/models';
    } else if (provider === 'deepseek') {
      targetUrl = 'https://api.deepseek.com/models';
    } else if (provider === 'openrouter') {
      targetUrl = 'https://openrouter.ai/api/v1/models';
    } else if (provider === 'openai') {
      targetUrl = 'https://api.openai.com/v1/models';
    } else if (provider === 'lmstudio') {
      const base = normalizeCustomBaseUrl(customBaseUrl || baseUrl, 'http://127.0.0.1:1234/v1');
      targetUrl = `${base.replace(/\/+$/, '')}/models`;
    } else {
      // Custom
      const base = normalizeCustomBaseUrl(customBaseUrl || baseUrl, 'https://api.openai.com/v1');
      targetUrl = `${base.replace(/\/+$/, '')}/models`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const finalKey = apiKey || (provider === 'groq' ? process.env.GROQ_API_KEY : provider === 'openai' ? process.env.OPENAI_API_KEY : undefined);
    if (finalKey && finalKey.trim()) {
      headers['Authorization'] = `Bearer ${finalKey.trim()}`;
    }

    const res = await fetch(targetUrl, { headers });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Endpoint (${res.status} ${res.statusText}): ${errText || 'Falha ao buscar lista de modelos'}`);
    }

    const data = await res.json();
    const rawList = data.data || data.models || [];
    models = rawList
      .map((item: any) => (typeof item === 'string' ? item : item.id || item.name))
      .filter((id: string) => id && typeof id === 'string' && !id.includes('whisper') && !id.includes('tts') && !id.includes('dall-e') && !id.includes('embedding'));

    // Ordena alfabeticamente
    models.sort();

    return NextResponse.json({ ok: true, models, count: models.length });
  } catch (error: any) {
    console.error('Erro em /api/iaagent/models:', error);
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || 'Falha ao carregar modelos do endpoint.',
        models: [],
      },
      { status: 500 }
    );
  }
}
