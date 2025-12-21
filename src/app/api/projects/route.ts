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
      try {
        const inserted = await db.insert(projects).values({
          user_id: userId,
          title,
          status: 'Em planejamento',
          progress: 0,
        }).returning();
        return NextResponse.json({ project: inserted[0] }, { status: 201 });
      } catch (error) {
        console.error('projects POST error', error);
        return NextResponse.json({ message: 'Erro ao criar projeto.' }, { status: 500 });
      }
        }
      | undefined;

    if (!project) {
      return NextResponse.json({ project: null, updates: [] }, { status: 200 });
    }

              const allProjects = await db.select()
                .from(projects)
                .where(eq(projects.user_id, userId))
                .orderBy(desc(projects.updated_at));
    return NextResponse.json(
      {
        message:
          'Erro ao consultar projetos. Verifique se o Postgres está configurado e se as tabelas existem (scripts/schema.sql).',
                  const lastUpdate = await db.select({ message: project_updates.message })
                    .from(project_updates)
                    .where(eq(project_updates.project_id, p.id))
                    .orderBy(desc(project_updates.created_at))
                    .limit(1);

export async function POST(req: Request) {
  let body: { userId?: number; title?: string };
  try {
    body = (await req.json()) as { userId?: number; title?: string };
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
            const projectArr = await db.select()
              .from(projects)
              .where(eq(projects.user_id, userId))
              .orderBy(desc(projects.updated_at))
              .limit(1);

  if (!userId || !Number.isFinite(userId) || !title) {
    return NextResponse.json({ message: 'userId e title são obrigatórios.' }, { status: 400 });
  }

  try {
    const result = await getPool().query(
            const updates = await db.select()
              .from(project_updates)
              .where(eq(project_updates.project_id, project.id))
              .orderBy(desc(project_updates.created_at))
              .limit(20);
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
    // Busca o projeto mais recente do usuário
    const projectArr = await db.select({ id: projects.id }).from(projects)
      .where(eq(projects.user_id, userId))
      .orderBy(desc(projects.updated_at))
      .limit(1);
    if (!projectArr[0]) {
      return NextResponse.json({ message: 'Nenhum projeto encontrado para este usuário.' }, { status: 404 });
    }
    const projectId = Number(projectArr[0].id);

    // Atualiza o projeto
    const updatedArr = await db.update(projects)
      .set({
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        project_type: projectType,
        final_date: finalDate,
        updated_at: new Date().toISOString(),
        status: 'Discussão',
      })
      .where(eq(projects.id, projectId))
      .returning();
    const project = updatedArr[0];

    // Kanban: cria card automático se necessário
    try {
      const colArr = await db.select({ id: kanban_columns.id }).from(kanban_columns)
        .where(eq(kanban_columns.project_id, projectId))
        .where(eq(kanban_columns.title, 'Discussão (Sobre o Projeto)'))
        .limit(1);
      if (colArr[0]) {
        const columnId = Number(colArr[0].id);
        const cardArr = await db.select({ id: kanban_cards.id }).from(kanban_cards)
          .where(eq(kanban_cards.column_id, columnId))
          .limit(1);
        if (!cardArr[0]) {
          const dados = [
            `Nome: ${project.client_name || '-'}`,
            `E-mail: ${project.client_email || '-'}`,
            `Telefone: ${project.client_phone || '-'}`,
            `Tipo: ${project.project_type || '-'}`,
            `Data final: ${project.final_date ? String(project.final_date).slice(0,10) : '-'}`
          ].join('\n');
          await db.insert(kanban_cards).values({
            column_id: columnId,
            title: 'Discussão do Projeto',
            description: dados,
            position: 0,
          });
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
    const deletedArr = await db.delete(projects)
      .where(eq(projects.id, projectId))
      .where(eq(projects.user_id, userId))
      .returning();
    if (!deletedArr[0]) {
      return NextResponse.json({ message: 'Projeto não encontrado ou sem permissão.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('projects DELETE error', error);
    return NextResponse.json({ message: 'Erro ao deletar projeto.' }, { status: 500 });
  }
}
