import { NextRequest, NextResponse } from 'next/server';

let mockMessages: Record<string, any[]> = {};

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
    const message = {
      id: Date.now().toString(),
      role: body.role || 'user',
      content: body.content,
      createdAt: new Date().toISOString()
    };
    mockMessages[resolvedParams.id].push(message);

    // Mock an AI response just to make the UI work
    setTimeout(() => {
      mockMessages[resolvedParams.id].push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Esta é uma resposta simulada. O backend da IA ainda não foi integrado.',
        createdAt: new Date().toISOString()
      });
    }, 1000);

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
