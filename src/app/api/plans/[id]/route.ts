import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { PlanEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });

    const body = await request.json();
    const { name, tagline, price, price_note, featured, features, sort_order } = body ?? {};

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(PlanEntity);

    const existing = await repo.findOne({ where: { id } });
    if (!existing) return NextResponse.json({ message: 'Plano não encontrado.' }, { status: 404 });

    const patch: Partial<PlanEntity> = { updated_by: Number(auth.id), updated_at: new Date().toISOString() };
    if (typeof name === 'string') patch.name = name;
    if (typeof tagline === 'string') patch.tagline = tagline;
    if (price === null || typeof price === 'string') patch.price = price || null;
    if (price_note === null || typeof price_note === 'string') patch.price_note = price_note || null;
    if (typeof featured === 'boolean') patch.featured = featured;
    if (Array.isArray(features)) patch.features = features.filter((f) => typeof f === 'string');
    if (typeof sort_order === 'number') patch.sort_order = sort_order;

    await repo.update({ id }, patch);
    const updated = await repo.findOneOrFail({ where: { id } });

    return NextResponse.json({ plan: updated, message: 'Plano atualizado.' });
  } catch (error) {
    console.error('Erro em PATCH /api/plans/[id]:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar plano.' }, { status: 500 });
  }
}
