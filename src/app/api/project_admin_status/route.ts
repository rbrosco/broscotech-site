
import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { and, eq } from 'drizzle-orm';
import { projects, users } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';

export const runtime = 'nodejs';

async function getUserRole(userId: number): Promise<string | null> {
  const found = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const role = found[0]?.role;
  return typeof role === 'string' ? role : null;
}

export async function DELETE(req: Request) {
  const user = requireAuth(req.headers);
  const userId = user?.id ? Number(user.id) : NaN;
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const role = await getUserRole(userId);
  if (role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  let body: { projectId?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
  }
  const { projectId } = body;
  if (!projectId) {
    return NextResponse.json({ message: 'projectId é obrigatório.' }, { status: 400 });
  }
  try {
    await db.delete(projects).where(eq(projects.id, projectId));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('project_admin_status DELETE error', error);
    return NextResponse.json({ message: 'Erro ao excluir projeto.' }, { status: 500 });
  }
}
export async function GET(req: Request) {
  const user = requireAuth(req.headers);
  const userId = user?.id ? Number(user.id) : NaN;
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const projectIdRaw = url.searchParams.get('projectId');
  if (!projectIdRaw) {
    return NextResponse.json({ message: 'projectId é obrigatório.' }, { status: 400 });
  }
  const projectId = Number(projectIdRaw);
  if (!Number.isFinite(projectId)) {
    return NextResponse.json({ message: 'projectId inválido.' }, { status: 400 });
  }
  try {
    const role = await getUserRole(userId);

    const projArr = await db
      .select({ user_id: projects.user_id, admin_status: projects.admin_status })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    const row = projArr[0] as { user_id?: number; admin_status?: string | null } | undefined;
    if (!row) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    const ownerId = typeof row.user_id === 'number' ? row.user_id : Number(row.user_id);
    const isOwner = Number.isFinite(ownerId) && ownerId === userId;
    const isAdmin = role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const adminStatus = typeof row.admin_status === 'string' ? row.admin_status : null;
    return NextResponse.json({ admin_status: adminStatus || null }, { status: 200 });
  } catch (error) {
    console.error('project_admin_status GET error', error);
    return NextResponse.json({ message: 'Erro ao consultar status admin.' }, { status: 500 });
  }
}
export async function PATCH(req: Request) {
  const user = requireAuth(req.headers);
  const userId = user?.id ? Number(user.id) : NaN;
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const role = await getUserRole(userId);
  if (role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

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
    await db
      .update(projects)
      .set({ admin_status: status, updated_at: new Date().toISOString() })
      .where(eq(projects.id, projectId));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('project_accept PATCH error', error);
    return NextResponse.json({ message: 'Erro ao atualizar status do projeto.' }, { status: 500 });
  }
}
