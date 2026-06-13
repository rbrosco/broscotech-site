import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { ai_messages, ai_sessions } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';
import { requireAuth } from '@/lib/middlewareAuth';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const resolvedParams = await params;
    
    // Validar se a sessão existe
    const sessionExists = await db.select().from(ai_sessions).where(eq(ai_sessions.id, resolvedParams.id)).limit(1);
    if (!sessionExists.length) {
      return NextResponse.json({ message: 'Sessão não encontrada' }, { status: 404 });
    }

    const dbMessages = await db.select().from(ai_messages).where(eq(ai_messages.session_id, resolvedParams.id)).orderBy(asc(ai_messages.created_at));
    
    const messages = dbMessages.map(m => ({
      id: m.id,
      text: m.content,
      from: m.role,
      imageUrl: m.image_url,
      timestamp: m.created_at
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    return NextResponse.json({ message: 'Erro ao listar mensagens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const resolvedParams = await params;
    const body = await request.json();
    
    const sessionExists = await db.select().from(ai_sessions).where(eq(ai_sessions.id, resolvedParams.id)).limit(1);
    if (!sessionExists.length) {
      return NextResponse.json({ message: 'Sessão não encontrada' }, { status: 404 });
    }
    
    const from = body.from || (body.role === 'assistant' ? 'agent' : 'client');
    const text = body.text || body.content || '';
    const imageUrl = body.imageUrl || null;
    
    const newId = randomUUID();

    const [created] = await db.insert(ai_messages).values({
      id: newId,
      session_id: resolvedParams.id,
      role: from,
      content: text,
      image_url: imageUrl
    }).returning();

    const message = {
      id: created.id,
      text: created.content,
      from: created.role,
      imageUrl: created.image_url,
      timestamp: created.created_at
    };

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    return NextResponse.json({ message: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
