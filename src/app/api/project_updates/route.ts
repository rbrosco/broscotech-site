import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

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
    const result = await getPool().query(
      'INSERT INTO project_updates (project_id, kind, message, created_at) VALUES ($1, $2, $3, now()) RETURNING id, kind, message, created_at',
      [projectId, kind, message, ]
    );
    return NextResponse.json({ update: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('project_updates POST error', error);
    return NextResponse.json({ message: 'Erro ao criar atualização.' }, { status: 500 });
  }
}
