import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { projects, project_updates, kanban_columns, kanban_cards, ai_sessions, ai_messages, notifications, invoices } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { and, desc, eq as drizzleEq, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const body = await request.json();

    const title = (body.title ?? 'Seu Projeto') as string;
    const clientName = (body.clientName ?? null) as string | null;
    const clientEmail = (body.clientEmail ?? null) as string | null;
    const clientPhone = (body.clientPhone ?? null) as string | null;
    const projectType = (body.projectType ?? null) as string | null;
    const finalDate = (body.finalDate ?? null) as string | null;
    const language = (body.language ?? null) as string | null;
    const framework = (body.framework ?? null) as string | null;
    const integrations = (body.integrations ?? null) as string | null;

    const [created] = await db
      .insert(projects)
      .values({
        user_id: userId,
        title,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        project_type: projectType,
        final_date: finalDate,
        language,
        framework,
        integrations,
        progress: 0,
        status: 'Em planejamento',
      })
      .returning();

    return NextResponse.json({ project: created, message: 'Projeto criado.' });
  } catch (error) {
    console.error('Erro em /api/projects POST:', error);
    return NextResponse.json({ message: 'Erro interno ao criar projeto.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const all = url.searchParams.get('all');

    const userId = Number(auth.id);

    // Se for admin, retorna todos os projetos e todos os updates
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (isAdmin) {
      const list = await db
        .select()
        .from(projects)
        .orderBy(desc(projects.updated_at));
      // Para cada projeto, busca os updates
      const projectsWithUpdates = await Promise.all(list.map(async (project) => {
        const rawUpdates = await db
          .select()
          .from(project_updates)
          .where(drizzleEq(project_updates.project_id, project.id))
          .orderBy(desc(project_updates.created_at));
        const updates = rawUpdates.map(u => ({
          id: Number(u.id),
          kind: u.kind ?? 'update',
          message: u.message ?? '',
          created_at: u.created_at ?? ''
        }));
        return { ...project, updates };
      }));
      return NextResponse.json({ projects: projectsWithUpdates });
    }

    if (all === '1') {
      const list = await db
        .select()
        .from(projects)
        .where(drizzleEq(projects.user_id, userId))
        .orderBy(desc(projects.updated_at));

      const projectsWithUpdates = await Promise.all(
        list.map(async (project) => {
          const rawUpdates = await db
            .select()
            .from(project_updates)
            .where(drizzleEq(project_updates.project_id, project.id))
            .orderBy(desc(project_updates.created_at));
          const updates = rawUpdates.map((u) => ({
            id: Number(u.id),
            kind: u.kind ?? 'update',
            message: u.message ?? '',
            created_at: u.created_at ?? '',
          }));
          return { ...project, updates };
        })
      );
      return NextResponse.json({ projects: projectsWithUpdates });
    }

    const list = await db
      .select()
      .from(projects)
      .where(drizzleEq(projects.user_id, userId))
      .orderBy(desc(projects.updated_at))
      .limit(1);

    const project = list[0] ?? null;

    let updates: Array<{ id: number; kind: string; message: string; created_at: string }> = [];
    if (project) {
      const rawUpdates = await db
        .select()
        .from(project_updates)
        .where(drizzleEq(project_updates.project_id, project.id))
        .orderBy(desc(project_updates.created_at));
      updates = rawUpdates.map(u => ({
        id: Number(u.id),
        kind: u.kind ?? 'update',
        message: u.message ?? '',
        created_at: u.created_at ?? ''
      }));
    }

    return NextResponse.json({ project, updates });
  } catch (error) {
    console.error('Erro em /api/projects GET:', error);
    return NextResponse.json({ message: 'Erro interno ao buscar projetos.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const body = await request.json();
    const projectId = Number(body.id);
    if (!projectId) {
      return NextResponse.json({ message: 'ID do projeto é obrigatório para atualizar.' }, { status: 400 });
    }

    const title = (body.title ?? null) as string | null;
    const clientName = (body.clientName ?? null) as string | null;
    const clientEmail = (body.clientEmail ?? null) as string | null;
    const clientPhone = (body.clientPhone ?? null) as string | null;
    const projectType = (body.projectType ?? null) as string | null;
    const finalDate = (body.finalDate ?? null) as string | null;
    const language = (body.language ?? null) as string | null;
    const framework = (body.framework ?? null) as string | null;
    const integrations = (body.integrations ?? null) as string | null;

    const [updated] = await db
      .update(projects)
      .set({
        title: title ?? undefined,
        client_name: clientName ?? undefined,
        client_email: clientEmail ?? undefined,
        client_phone: clientPhone ?? undefined,
        project_type: projectType ?? undefined,
        final_date: finalDate ?? undefined,
        language: language ?? undefined,
        framework: framework ?? undefined,
        integrations: integrations ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .where(and(drizzleEq(projects.id, projectId), drizzleEq(projects.user_id, userId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ project: updated, message: 'Projeto atualizado.' });
  } catch (error) {
    console.error('Erro em /api/projects PATCH:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar projeto.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const isAdmin = ((auth as { role?: string }).role === 'admin');

    const url = new URL(request.url);
    const projectIdParam = url.searchParams.get('projectId');
    const body = await request.json().catch(() => ({}));
    const projectId = Number(projectIdParam || body.id || body.projectId);

    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ message: 'ID do projeto é obrigatório.' }, { status: 400 });
    }

    // Busca o projeto para verificar permissão
    const [project] = await db
      .select()
      .from(projects)
      .where(drizzleEq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    if (!isAdmin && Number(project.user_id) !== userId) {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    // Excluir registros vinculados em ordem de dependência (com try/catch por tabela)
    try {
      const sessions = await db.select({ id: ai_sessions.id }).from(ai_sessions).where(drizzleEq(ai_sessions.project_id, projectId));
      const sessionIds = sessions.map(s => s.id);
      if (sessionIds.length > 0) {
        await db.delete(ai_messages).where(inArray(ai_messages.session_id, sessionIds));
      }
      await db.delete(ai_sessions).where(drizzleEq(ai_sessions.project_id, projectId));
    } catch {}

    try {
      const cols = await db.select({ id: kanban_columns.id }).from(kanban_columns).where(drizzleEq(kanban_columns.project_id, projectId));
      const colIds = cols.map(c => Number(c.id));
      if (colIds.length > 0) {
        await db.delete(kanban_cards).where(inArray(kanban_cards.column_id, colIds));
      }
      await db.delete(kanban_columns).where(drizzleEq(kanban_columns.project_id, projectId));
    } catch {}

    try { await db.delete(project_updates).where(drizzleEq(project_updates.project_id, projectId)); } catch {}
    try { await db.delete(notifications).where(drizzleEq(notifications.project_id, projectId)); } catch {}
    try { await db.delete(invoices).where(drizzleEq(invoices.project_id, projectId)); } catch {}

    // 4. projeto
    await db.delete(projects).where(drizzleEq(projects.id, projectId));

    return NextResponse.json({ message: 'Projeto excluído com sucesso.' });
  } catch (error) {
    console.error('Erro em /api/projects DELETE:', error);
    return NextResponse.json({ message: 'Erro interno ao excluir projeto.' }, { status: 500 });
  }
}
