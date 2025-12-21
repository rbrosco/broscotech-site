import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { project_updates, projects } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { and, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const projectId = Number(body.projectId ?? NaN);
    const userId = Number(body.userId ?? NaN);
    const kind = (body.kind as string | undefined) || 'update';
    const message = String(body.message ?? '');

    if (!Number.isFinite(projectId) || !Number.isFinite(userId)) {
      return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const owner = await db
      .select({ user_id: projects.user_id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!owner[0] || Number(owner[0].user_id) !== userId || Number(auth.id) !== userId) {
      return NextResponse.json({ message: 'Não autorizado a atualizar este projeto.' }, { status: 403 });
    }

    const [created] = await db
      .insert(project_updates)
      .values({ project_id: projectId, kind, message })
      .returning();

    return NextResponse.json({ update: created, message: 'Atualização registrada.' });
  } catch (error) {
    console.error('Erro em /api/project_updates POST:', error);
    return NextResponse.json({ message: 'Erro interno ao criar atualização.' }, { status: 500 });
  }
}
