import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userIdRaw = url.searchParams.get('userId');

  if (!userIdRaw) {
    return NextResponse.json({ message: 'userId é obrigatório.' }, { status: 400 });
  }

  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: 'userId inválido.' }, { status: 400 });
  }

  try {
    const projectResult = await getPool().query(
      'SELECT id, title, status, progress, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );

    const project = projectResult.rows[0] as
      | { id: number; title: string; status: string; progress: number; updated_at: string }
      | undefined;

    if (!project) {
      return NextResponse.json({ project: null, updates: [] }, { status: 200 });
    }

    const updatesResult = await getPool().query(
      'SELECT id, kind, message, created_at FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC LIMIT 20',
      [project.id]
    );

    return NextResponse.json({ project, updates: updatesResult.rows }, { status: 200 });
  } catch (error) {
    console.error('projects GET error', error);
    return NextResponse.json(
      {
        message:
          'Erro ao consultar projetos. Verifique se o Postgres está configurado e se as tabelas existem (scripts/schema.sql).',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let body: { userId?: number; title?: string };
  try {
    body = (await req.json()) as { userId?: number; title?: string };
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
  }

  const userId = body.userId;
  const title = body.title?.trim();

  if (!userId || !Number.isFinite(userId) || !title) {
    return NextResponse.json({ message: 'userId e title são obrigatórios.' }, { status: 400 });
  }

  try {
    const result = await getPool().query(
      'INSERT INTO projects (user_id, title, status, progress) VALUES ($1, $2, $3, $4) RETURNING id, title, status, progress, updated_at',
      [userId, title, 'Em planejamento', 0]
    );

    return NextResponse.json({ project: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('projects POST error', error);
    return NextResponse.json({ message: 'Erro ao criar projeto.' }, { status: 500 });
  }
}
