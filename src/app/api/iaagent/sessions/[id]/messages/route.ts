import { NextRequest, NextResponse } from 'next/server';
import { mockMessages } from '@/lib/ia-store';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const messages = mockMessages[resolvedParams.id] || [];
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    if (!mockMessages[resolvedParams.id]) {
      mockMessages[resolvedParams.id] = [];
    }
    
    // Suportar tanto o formato antigo (role/content) quanto o novo (from/text)
    const from = body.from || (body.role === 'assistant' ? 'agent' : 'client');
    const text = body.text || body.content || '';
    
    const message = {
      id: Date.now().toString(),
      text,
      from,
      timestamp: new Date().toISOString()
    };
    mockMessages[resolvedParams.id].push(message);

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
