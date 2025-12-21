import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { project_updates } from '@/lib/schema';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { projectId?: number; userId?: number; message?: string; kind?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
  }

  const { projectId, userId, message, kind } = body;
  if (!projectId || !userId || !message || !kind) {
    return NextResponse.json({ message: 'Campos obrigatórios faltando.' }, { status: 400 });
  }

  try {
    const inserted = await db
      .insert(project_updates)
      .values({
        project_id: projectId,
        kind,
        message,
        created_at: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ update: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('project_updates POST error', error);
    return NextResponse.json({ message: 'Erro ao criar atualização.' }, { status: 500 });
  }
}
