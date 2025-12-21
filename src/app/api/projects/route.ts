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
      'SELECT id, title, status, progress, updated_at, client_name, client_email, client_phone, project_type, final_date FROM projects WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );

    const project = projectResult.rows[0] as
      | {
          id: number;
          title: string;
          status: string;
          progress: number;
          updated_at: string;
          client_name: string | null;
          client_email: string | null;
          client_phone: string | null;
          project_type: string | null;
          final_date: string | null;
        }
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
      'INSERT INTO projects (user_id, title, status, progress) VALUES ($1, $2, $3, $4) RETURNING id, title, status, progress, updated_at, client_name, client_email, client_phone, project_type, final_date',
      [userId, title, 'Em planejamento', 0]
    );

    return NextResponse.json({ project: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('projects POST error', error);
    return NextResponse.json({ message: 'Erro ao criar projeto.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  let body: {
    userId?: number;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    projectType?: string;
    finalDate?: string;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
  }

  const userId = body.userId;
  if (!userId || !Number.isFinite(userId)) {
    return NextResponse.json({ message: 'userId é obrigatório.' }, { status: 400 });
  }

  const clientName = body.clientName?.trim() || null;
  const clientEmail = body.clientEmail?.trim() || null;
  const clientPhone = body.clientPhone?.trim() || null;
  const projectType = body.projectType?.trim() || null;
  const finalDate = body.finalDate?.trim() || null;

  try {
    const existing = await getPool().query(
      'SELECT id FROM projects WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );

    if (!existing.rows[0]) {
      return NextResponse.json({ message: 'Nenhum projeto encontrado para este usuário.' }, { status: 404 });
    }

    const projectId = Number(existing.rows[0].id);

    const result = await getPool().query(
      'UPDATE projects SET client_name = $1, client_email = $2, client_phone = $3, project_type = $4, final_date = $5, updated_at = now() WHERE id = $6 RETURNING id, title, status, progress, updated_at, client_name, client_email, client_phone, project_type, final_date',
      [clientName, clientEmail, clientPhone, projectType, finalDate, projectId]
    );

    return NextResponse.json({ project: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('projects PATCH error', error);
    return NextResponse.json({ message: 'Erro ao atualizar projeto.' }, { status: 500 });
  }
}
