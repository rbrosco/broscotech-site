import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userIdRaw = url.searchParams.get('userId');
  const listAll = url.searchParams.get('all') === '1';

  if (!userIdRaw) {
    return NextResponse.json({ message: 'userId é obrigatório.' }, { status: 400 });
  }

  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: 'userId inválido.' }, { status: 400 });
  }

  try {
    if (listAll) {
      // Return all projects for the user including the latest update message (if any)
      const allRes = await getPool().query(
        `SELECT p.id, p.title, p.status, p.progress, p.updated_at, p.client_name, p.client_email, p.client_phone, p.project_type, p.final_date,
                (SELECT pu.message FROM project_updates pu WHERE pu.project_id = p.id ORDER BY pu.created_at DESC LIMIT 1) AS last_update
         FROM projects p
         WHERE p.user_id = $1
         ORDER BY p.updated_at DESC`,
        [userId]
      );
      return NextResponse.json({ projects: allRes.rows }, { status: 200 });
    }

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
      `UPDATE projects
        SET client_name = $1,
            client_email = $2,
            client_phone = $3,
            project_type = $4,
            final_date = $5,
            updated_at = now(),
            status = 'Discussão'
       WHERE id = $6
       RETURNING id, title, status, progress, updated_at, client_name, client_email, client_phone, project_type, final_date`,
      [clientName, clientEmail, clientPhone, projectType, finalDate, projectId]
    );

    // Após atualizar o projeto, cria um card na coluna 'Discussão (Sobre o Projeto)' se não existir nenhum para o projeto
    const project = result.rows[0];
    try {
      const pool = getPool();
      // Busca o id da coluna 'Discussão (Sobre o Projeto)' para este projeto
      const colRes = await pool.query(
        "SELECT id FROM kanban_columns WHERE project_id = $1 AND title = $2 LIMIT 1",
        [projectId, 'Discussão (Sobre o Projeto)']
      );
      if (colRes.rowCount) {
        const columnId = Number(colRes.rows[0].id);
        // Verifica se já existe algum card nesta coluna
        const cardRes = await pool.query(
          "SELECT id FROM kanban_cards WHERE column_id = $1 LIMIT 1",
          [columnId]
        );
        if (!cardRes.rowCount) {
          // Monta dados do projeto para o card
          const dados = [
            `Nome: ${project.client_name || '-'}`,
            `E-mail: ${project.client_email || '-'}`,
            `Telefone: ${project.client_phone || '-'}`,
            `Tipo: ${project.project_type || '-'}`,
            `Data final: ${project.final_date ? String(project.final_date).slice(0,10) : '-'}`
          ].join('\n');
          await pool.query(
            "INSERT INTO kanban_cards (column_id, title, description, position) VALUES ($1, $2, $3, $4)",
            [columnId, 'Discussão do Projeto', dados, 0]
          );
        }
      }
    } catch (err) {
      console.error('Erro ao criar card automático no Kanban:', err);
    }
    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error('projects PATCH error', error);
    return NextResponse.json({ message: 'Erro ao atualizar projeto.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  let body: { projectId?: number; userId?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
  }

  const { projectId, userId } = body;
  if (!projectId || !Number.isFinite(projectId) || !userId || !Number.isFinite(userId)) {
    return NextResponse.json({ message: 'projectId e userId são obrigatórios.' }, { status: 400 });
  }

  try {
    // Remove projeto apenas se pertencer ao usuário
    const res = await getPool().query('DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id', [projectId, userId]);
    if (!res.rowCount) {
      return NextResponse.json({ message: 'Projeto não encontrado ou sem permissão.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('projects DELETE error', error);
    return NextResponse.json({ message: 'Erro ao deletar projeto.' }, { status: 500 });
  }
}
