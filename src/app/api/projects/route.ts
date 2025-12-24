import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { projects, project_updates } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
// IMPORTANT: eq must be imported from drizzle-orm. Renamed to drizzleEq to avoid shadowing.
import { and, desc, eq as drizzleEq } from 'drizzle-orm';

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
        return { project, updates };
      }));
      return NextResponse.json({ projects: projectsWithUpdates });
    }

    if (all === '1') {
      const list = await db
        .select()
        .from(projects)
        .where(drizzleEq(projects.user_id, userId))
        .orderBy(desc(projects.updated_at));
      return NextResponse.json({ projects: list });
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

    const title = (body.title ?? null) as string | null;
    const clientName = (body.clientName ?? null) as string | null;
    const clientEmail = (body.clientEmail ?? null) as string | null;
    const clientPhone = (body.clientPhone ?? null) as string | null;
    const projectType = (body.projectType ?? null) as string | null;
    // language, framework, integrations removed from schema
    const finalDate = (body.finalDate ?? null) as string | null;

    const existingList = await db
      .select()
      .from(projects)
      .where(drizzleEq(projects.user_id, userId))
      .orderBy(desc(projects.updated_at))
      .limit(1);

    const existing = existingList[0];

    if (!existing) {
      const [created] = await db
        .insert(projects)
        .values({
          user_id: userId,
          title: title || 'Seu Projeto',
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          project_type: projectType,
          final_date: finalDate,
          progress: 0,
          status: 'Em planejamento',
        })
        .returning();

      return NextResponse.json({ project: created, message: 'Projeto criado.' });
    }

    const [updated] = await db
      .update(projects)
      .set({
        title: title ?? existing.title,
        client_name: clientName ?? existing.client_name,
        client_email: clientEmail ?? existing.client_email,
        client_phone: clientPhone ?? existing.client_phone,
        project_type: projectType ?? existing.project_type,
        final_date: finalDate ?? existing.final_date,
        updated_at: new Date().toISOString(),
      })
      .where(and(drizzleEq(projects.id, existing.id), drizzleEq(projects.user_id, userId)))
      .returning();

    return NextResponse.json({ project: updated, message: 'Projeto atualizado.' });
  } catch (error) {
    console.error('Erro em /api/projects PATCH:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar projeto.' }, { status: 500 });
  }
}
