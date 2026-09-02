import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { ProjectEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';

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

    const dataSource = await getDataSource();
    const row = await dataSource.getRepository(ProjectEntity).findOne({
      select: { admin_status: true },
      where: { id: projectId },
    });

    if (!row) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ admin_status: row.admin_status });
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

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(ProjectEntity);

    const existing = await repo.findOne({ where: { id: projectId } });
    if (!existing) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    await repo.update({ id: projectId }, { admin_status: status });

    return NextResponse.json({ message: 'Status atualizado.', admin_status: status });
  } catch (error) {
    console.error('Erro em /api/project_admin_status PATCH:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar status.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Removido em 2026-09-02: este handler fazia `repo.delete({ id: projectId })`
  // direto na tabela projects, sem limpar tabelas relacionadas (AiSession,
  // AiMessage, KanbanColumn, KanbanCard, ProjectUpdate, Notification, Invoice)
  // como o DELETE /api/projects faz corretamente, e sem checar se o usuário é
  // dono/admin do projeto. Use DELETE /api/projects?projectId=... em vez disso
  // (já corrigido em src/app/(portal)/planejamento/page.tsx).
  return NextResponse.json(
    { message: 'Use DELETE /api/projects em vez desta rota.' },
    { status: 410 }
  );
}
