import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewareAuth';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = requireAuth(request.headers as unknown as { get(name: string): string | null });
  if (!user || !user.id) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  // Busca o role direto do banco (independe do JWT ter o campo role)
  try {
    const rows = await db.select().from(users).where(eq(users.id, Number(user.id))).limit(1);
    const row = rows[0];
    if (!row) return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });

    return NextResponse.json({
      id: row.id,
      name: row.name,
      login: row.login,
      email: row.email,
      role: row.role ?? 'user',
      avatar: (row as { avatar?: string | null }).avatar ?? null,
      phone: (row as { phone?: string | null }).phone ?? null,
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
