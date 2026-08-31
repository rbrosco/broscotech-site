import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewareAuth';
import { getDataSource } from '@/lib/typeorm';
import { UserEntity } from '@/lib/entities';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = requireAuth(request.headers as unknown as { get(name: string): string | null });
  if (!user || !user.id) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  // Busca o role direto do banco (independe do JWT ter o campo role)
  try {
    const dataSource = await getDataSource();
    const row = await dataSource.getRepository(UserEntity).findOne({ where: { id: Number(user.id) } });
    if (!row) return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });

    return NextResponse.json({
      id: row.id,
      name: row.name,
      login: row.login,
      email: row.email,
      role: row.role ?? 'user',
      avatar: (row as { avatar?: string | null }).avatar ?? null,
      phone: row.phone ?? null,
    });
  } catch {
    // Fallback: usa dado do JWT se banco falhar
    const rawRole = (user as { role?: unknown }).role;
    const role = typeof rawRole === 'string' ? rawRole : 'user';
    return NextResponse.json({
      id: user.id, name: user.name, login: user.login, email: user.email, role,
      avatar: (user as { avatar?: string | null }).avatar ?? null,
      phone: null,
    });
  }
}
