import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

type IncomingMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type Body = {
  messages?: IncomingMessage[];
};

function safeMessages(messages: IncomingMessage[]): IncomingMessage[] {
  return messages
    .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant' || m.role === 'system'))
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
  }

  const messages = safeMessages(Array.isArray(body.messages) ? body.messages : []);
  if (messages.length === 0) {
    return NextResponse.json({ message: 'Envie messages.' }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          'GROQ_API_KEY não configurada no servidor. Configure a variável de ambiente para habilitar respostas reais.',
        assistant:
          'Para eu responder de verdade, o servidor precisa de `GROQ_API_KEY`. Enquanto isso, me diga: qual seu objetivo (site, sistema, automação, chatbot) e o prazo?',
      },
      { status: 200 }
    );
  }

  try {
    const groq = new Groq({ apiKey });
    
    const chatCompletion = await groq.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'Você é um IA Agent da BROSCOTECH. Seu trabalho é coletar requisitos, sugerir arquitetura (web/app, dashboard, automações, integrações) e transformar em um briefing objetivo com próximos passos. Responda em pt-BR, com tom direto e profissional, sem enrolação.',
        },
        ...messages,
      ],
    });

    const assistant = chatCompletion.choices[0]?.message?.content;
    if (typeof assistant !== 'string' || assistant.trim().length === 0) {
      return NextResponse.json({ message: 'Resposta vazia da IA.' }, { status: 502 });
    }

    return NextResponse.json({ assistant }, { status: 200 });
  } catch (error) {
    console.error('iaagent error', error);
    return NextResponse.json({ message: 'Erro ao conectar com a IA.' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: 'Método não permitido' }, { status: 405 });
}
