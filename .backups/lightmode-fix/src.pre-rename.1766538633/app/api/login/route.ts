import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/schema';
import { eq, or } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body ?? {};

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Login ou e-mail e senha são obrigatórios.' }, { status: 400 });
    }


    // Busca usuário por login OU email
    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.login, identifier), eq(users.email, identifier)))
      .limit(1);

    const user = rows[0];
    if (!user) {
      console.log(`[LOGIN] Falha: usuário não encontrado para identifier="${identifier}"`);
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log(`[LOGIN] Falha: senha incorreta para user id=${user.id}, login=${user.login}, email=${user.email}`);
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    console.log(`[LOGIN] Sucesso: user id=${user.id}, login=${user.login}, email=${user.email}`);

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        login: user.login,
        email: user.email,
      },
      secret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      message: 'Login realizado com sucesso.',
      user: { id: user.id, name: user.name, login: user.login, email: user.email },
    });

    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Erro em /api/login:', error);
    return NextResponse.json({ message: 'Erro interno ao efetuar login.' }, { status: 500 });
  }
}