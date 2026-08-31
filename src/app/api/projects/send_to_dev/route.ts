import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { ProjectEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }
    const url = new URL(req.url!);
    const projectId = url.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(ProjectEntity);

    const existing = await repo.findOne({ where: { id: Number(projectId) } });
    if (!existing) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    // Atualiza o status do projeto para 'enviado'
    await repo.update({ id: Number(projectId) }, { status: 'enviado', updated_at: new Date().toISOString() });
    const updated = await repo.findOneOrFail({ where: { id: Number(projectId) } });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
