import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const projectIdRaw = url.searchParams.get('projectId');
    const projectId = projectIdRaw ? Number(projectIdRaw) : NaN;

    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ message: 'projectId inválido.' }, { status: 400 });
    }

    const rows = await db
      .select({ admin_status: projects.admin_status })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!rows[0]) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ admin_status: rows[0].admin_status });
  } catch (error) {
    console.error('Erro em /api/project_admin_status GET:', error);
    return NextResponse.json({ message: 'Erro interno ao buscar status do projeto.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const projectId = Number(body.projectId ?? NaN);
    const status = String(body.status ?? '');

    if (!Number.isFinite(projectId) || !status) {
      return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    // Não há role no token, então só permite PATCH se o usuário for o mesmo do projeto (ou admin futuramente)

    const [updated] = await db
      .update(projects)
      .set({ admin_status: status })
      .where(eq(projects.id, projectId))
      .returning();

    if (!updated) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Status atualizado.', admin_status: updated.admin_status });
  } catch (error) {
    console.error('Erro em /api/project_admin_status PATCH:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar status.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const projectId = Number(body.projectId ?? NaN);

    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ message: 'projectId inválido.' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, projectId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Projeto excluído.' });
  } catch (error) {
    console.error('Erro em /api/project_admin_status DELETE:', error);
    return NextResponse.json({ message: 'Erro interno ao excluir projeto.' }, { status: 500 });
  }
}
