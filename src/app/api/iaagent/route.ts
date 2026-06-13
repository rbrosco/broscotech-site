import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, apiKey, model, systemPrompt } = body;

    if (!apiKey) {
      return NextResponse.json(
        { reply: 'Erro: API Key da Groq não configurada. Configure no seu Painel (Configurações > IA Agent).' },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey });

    // Prepara as mensagens. Se houver system prompt, coloca ele primeiro.
    const groqMessages = [];
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

    const finalModel = hasImage ? 'llama-3.2-11b-vision-preview' : (model || 'llama-3.3-70b-versatile');

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: finalModel,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'Sem resposta do modelo.';
    
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Erro na API Groq:', error);
    return NextResponse.json(
      { reply: `Erro ao se comunicar com a Groq: ${error?.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}
