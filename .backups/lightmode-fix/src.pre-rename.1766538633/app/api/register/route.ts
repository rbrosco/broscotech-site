
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/schema';
import { or, eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, login, email, password, phone } = body ?? {};

    if (!name || !login || !email || !password) {
      return NextResponse.json({ message: 'Nome, login, e-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.login, login), eq(users.email, email)))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Login ou e-mail já cadastrado.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [created] = await db
      .insert(users)
      .values({
        name,
        login,
        email,
        password: passwordHash,
        phone: phone || null,
        role: 'user',
      })
      .returning();

    return NextResponse.json({
      message: 'Usuário criado com sucesso.',
      user: { id: created.id, name: created.name, login: created.login, email: created.email },
    });
  } catch (error) {
    console.error('Erro em /api/register:', error);
    return NextResponse.json({ message: 'Erro interno ao registrar usuário.' }, { status: 500 });
  }
}
