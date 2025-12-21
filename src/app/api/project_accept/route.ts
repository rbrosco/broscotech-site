import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

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
    const result = await getPool().query(
      'UPDATE projects SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, status',
      [status === 'accepted' ? 'Aceito' : 'Recusado', projectId]
    );
    return NextResponse.json({ project: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('project_accept PATCH error', error);
    return NextResponse.json({ message: 'Erro ao atualizar status do projeto.' }, { status: 500 });
  }
}
