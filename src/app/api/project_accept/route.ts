import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { eq } from 'drizzle-orm';
import { projects } from '@/lib/schema';

export const runtime = 'nodejs';

export async function PATCH(req: Request) {
  let body: { projectId?: number; status?: 'accepted' | 'rejected' };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
  }

  const { projectId, status } = body;
  if (!projectId || !status) {
    return NextResponse.json({ message: 'Campos obrigatórios faltando.' }, { status: 400 });
  }

  try {
    const updated = await db
      .update(projects)
      .set({ status: status === 'accepted' ? 'Aceito' : 'Recusado', updated_at: new Date().toISOString() })
      .where(eq(projects.id, projectId))
      .returning({ id: projects.id, status: projects.status });
    return NextResponse.json({ project: updated[0] }, { status: 200 });
  } catch (error) {
    console.error('project_accept PATCH error', error);
    return NextResponse.json({ message: 'Erro ao atualizar status do projeto.' }, { status: 500 });
  }
}
