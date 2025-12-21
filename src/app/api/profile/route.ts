import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(auth.id)))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ message: 'Perfil não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: row.id,
        name: row.name,
        login: row.login,
        email: row.email,
        phone: row.phone ?? null,
        role: row.role ?? 'user',
        avatar: null,
        created_at: row.created_at ?? null,
        updated_at: row.updated_at ?? null,
      },
    });
  } catch (error) {
    console.error('Erro em /api/profile GET:', error);
    return NextResponse.json({ message: 'Erro interno ao buscar perfil.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const body = await request.json();
    const { name, login, email, phone, currentPassword, newPassword } = body ?? {};

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ message: 'Perfil não encontrado.' }, { status: 404 });
    }

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ message: 'Informe a senha atual e a nova senha.' }, { status: 400 });
      }
      const ok = await bcrypt.compare(currentPassword, row.password);
      if (!ok) {
        return NextResponse.json({ message: 'Senha atual incorreta.' }, { status: 400 });
      }
    }

    const updateData: Partial<typeof users.$inferInsert> = {};
    if (typeof name === 'string') updateData.name = name;
    if (typeof login === 'string') updateData.login = login;
    if (typeof email === 'string') updateData.email = email;
    if (typeof phone === 'string') updateData.phone = phone;
    if (currentPassword && newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'Nada para atualizar.' });
    }

    const [updated] = await db
      .update(users)
      .set({ ...updateData, updated_at: new Date().toISOString() })
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso.',
      profile: {
        id: updated.id,
        name: updated.name,
        login: updated.login,
        email: updated.email,
        phone: updated.phone ?? null,
        role: updated.role ?? 'user',
        avatar: null,
        created_at: updated.created_at ?? null,
        updated_at: updated.updated_at ?? null,
      },
    });
  } catch (error) {
    console.error('Erro em /api/profile PATCH:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar perfil.' }, { status: 500 });
  }
}
