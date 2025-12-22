import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { projects } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { eq as drizzleEq } from 'drizzle-orm';

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
    // Atualiza o status do projeto para 'enviado'
    const [updated] = await db.update(projects)
      .set({ status: 'enviado', updated_at: new Date().toISOString() })
      .where(drizzleEq(projects.id, Number(projectId)))
      .returning();
    if (!updated) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}