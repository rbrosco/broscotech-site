import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { LeadEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const targetId = Number(id);
    if (!Number.isFinite(targetId)) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

    const body = await request.json().catch(() => null);
    const { status } = body ?? {};
    if (!status || !['new', 'contacted', 'won', 'lost'].includes(status)) {
      return NextResponse.json({ message: 'status inválido.' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(LeadEntity);

    const existing = await repo.findOne({ where: { id: targetId } });
    if (!existing) return NextResponse.json({ message: 'Lead não encontrado.' }, { status: 404 });

    await repo.update({ id: targetId }, { status });

    return NextResponse.json({ message: 'Lead atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro em PATCH /api/leads/[id]:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar lead.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const targetId = Number(id);
    if (!Number.isFinite(targetId)) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

    const dataSource = await getDataSource();
    await dataSource.getRepository(LeadEntity).delete({ id: targetId });

    return NextResponse.json({ message: 'Lead excluído com sucesso.' });
  } catch (error) {
    console.error('Erro em DELETE /api/leads/[id]:', error);
    return NextResponse.json({ message: 'Erro interno ao excluir lead.' }, { status: 500 });
  }
}
