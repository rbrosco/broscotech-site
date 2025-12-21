
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { requireAuth } from '@/lib/middlewareAuth';

export const runtime = 'nodejs';

async function getUserRole(userId: number): Promise<string | null> {
  const res = await getPool().query('SELECT role FROM users WHERE id = $1 LIMIT 1', [userId]);
  const role = res.rows[0]?.role;
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
    await getPool().query('DELETE FROM projects WHERE id = $1', [projectId]);
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

    const projectRes = await getPool().query('SELECT user_id, admin_status FROM projects WHERE id = $1 LIMIT 1', [
      projectId,
    ]);
    const row = projectRes.rows[0] as { user_id?: number; admin_status?: string | null } | undefined;
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
    await getPool().query(
      'UPDATE projects SET admin_status = $1, updated_at = now() WHERE id = $2',
      [status, projectId]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('project_accept PATCH error', error);
    return NextResponse.json({ message: 'Erro ao atualizar status do projeto.' }, { status: 500 });
  }
}
