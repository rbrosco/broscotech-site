import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import type { InferSelectModel } from 'drizzle-orm';
import { and, desc, eq } from 'drizzle-orm';
import { kanban_cards, kanban_columns, project_updates, projects } from '@/lib/schema';

export const runtime = 'nodejs';

type ProjectsResponse = {
  project: InferSelectModel<typeof projects> | null;
  updates: Array<{
    id: number;
    kind: string | null;
    message: string | null;
    created_at: string | null;
  }>;
};

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
      const allProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.user_id, userId))
        .orderBy(desc(projects.updated_at));

      const projectsWithUpdate = await Promise.all(
        allProjects.map(async (p) => {
          const lastUpdate = await db
            .select({ message: project_updates.message })
            .from(project_updates)
            .where(eq(project_updates.project_id, p.id))
            .orderBy(desc(project_updates.created_at))
            .limit(1);
          return { ...p, last_update: lastUpdate[0]?.message ?? null };
        })
      );

      return NextResponse.json({ projects: projectsWithUpdate }, { status: 200 });
    }

    const projectArr = await db
      .select()
      .from(projects)
      .where(eq(projects.user_id, userId))
      .orderBy(desc(projects.updated_at))
      .limit(1);

    const project = projectArr[0] ?? null;
    if (!project) {
      const empty: ProjectsResponse = { project: null, updates: [] };
      return NextResponse.json(empty, { status: 200 });
    }

    const updates = await db
      .select({
        id: project_updates.id,
        kind: project_updates.kind,
        message: project_updates.message,
        created_at: project_updates.created_at,
      })
      .from(project_updates)
      .where(eq(project_updates.project_id, project.id))
      .orderBy(desc(project_updates.created_at))
      .limit(20);

    return NextResponse.json({ project, updates } satisfies ProjectsResponse, { status: 200 });
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
    const inserted = await db
      .insert(projects)
      .values({ user_id: userId, title, status: 'Em planejamento', progress: 0 })
      .returning();

    return NextResponse.json({ project: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('projects POST error', error);
    return NextResponse.json({ message: 'Erro ao criar projeto.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  let body: {
    userId?: number;
    title?: string | null;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    projectType?: string;
    finalDate?: string;
    language?: string | null;
    framework?: string | null;
    integrations?: string | null;
    observations?: string | null;
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
  const language = body.language?.trim() || null;
  const framework = body.framework?.trim() || null;
  const integrations = body.integrations?.trim() || null;
  const title = body.title ? body.title.trim() : undefined;

  try {
    const projectArr = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.user_id, userId))
      .orderBy(desc(projects.updated_at))
      .limit(1);

    if (!projectArr[0]) {
      return NextResponse.json({ message: 'Nenhum projeto encontrado para este usuário.' }, { status: 404 });
    }

    const projectId = Number(projectArr[0].id);

    const updateData: Record<string, unknown> = {
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      project_type: projectType,
      final_date: finalDate,
      language,
      framework,
      integrations,
      updated_at: new Date().toISOString(),
      status: 'Discussão',
    };
    if (title) updateData.title = title;

    const updatedArr = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();

    const project = updatedArr[0];

    // Kanban: cria card automático se necessário
    try {
      const colArr = await db
        .select({ id: kanban_columns.id })
        .from(kanban_columns)
        .where(and(eq(kanban_columns.project_id, projectId), eq(kanban_columns.title, 'Discussão (Sobre o Projeto)')))
        .limit(1);

      if (colArr[0]) {
        const columnId = Number(colArr[0].id);
        const cardArr = await db
          .select({ id: kanban_cards.id })
          .from(kanban_cards)
          .where(eq(kanban_cards.column_id, columnId))
          .limit(1);

        if (!cardArr[0]) {
          const dados = [
            `Nome: ${project.client_name || '-'}`,
            `E-mail: ${project.client_email || '-'}`,
            `Telefone: ${project.client_phone || '-'}`,
            `Tipo: ${project.project_type || '-'}`,
            `Data final: ${project.final_date ? String(project.final_date).slice(0, 10) : '-'}`,
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

    // Observações continuam sendo persistidas como update pelo endpoint /api/project_updates
    void body.observations;

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
    const deletedArr = await db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.user_id, userId)))
      .returning({ id: projects.id });

    if (!deletedArr[0]) {
      return NextResponse.json({ message: 'Projeto não encontrado ou sem permissão.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('projects DELETE error', error);
    return NextResponse.json({ message: 'Erro ao deletar projeto.' }, { status: 500 });
  }
}
