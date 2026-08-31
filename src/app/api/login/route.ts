import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/schema';
import { eq, or } from 'drizzle-orm';
import { getJwtSecret } from '@/lib/jwtSecret';

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
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        login: user.login,
        email: user.email,
        role: user.role ?? 'user',
      },
      secret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      message: 'Login realizado com sucesso.',
      user: { id: user.id, name: user.name, login: user.login, email: user.email, role: user.role ?? 'user' },
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
    const isProd = process.env.NODE_ENV === 'production';
    const payload: any = { message: 'Erro interno ao efetuar login.' };
    if (!isProd) payload.error = String(error);
    return NextResponse.json(payload, { status: 500 });
  }
}