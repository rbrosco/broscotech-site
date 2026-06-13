import { NextRequest, NextResponse } from 'next/server';

let mockSessions: any[] = [];

export async function GET(request: NextRequest) {
  return NextResponse.json({ sessions: mockSessions });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = {
      id: Date.now().toString(),
      title: body.title || 'Nova Sessão',
      updatedAt: new Date().toISOString()
    };
    mockSessions.unshift(session);
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao criar sessão' }, { status: 500 });
  }
}
