import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { PlanEntity } from '@/lib/entities';

// GET público — usado pela seção de Planos da página inicial
export async function GET() {
  try {
    const dataSource = await getDataSource();
    const plans = await dataSource.getRepository(PlanEntity).find({
      order: { sort_order: 'ASC' },
    });
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Erro em GET /api/plans:', error);
    return NextResponse.json({ plans: [] }, { status: 500 });
  }
}
