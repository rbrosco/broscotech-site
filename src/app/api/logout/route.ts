import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logout efetuado.' });
    const isProd = process.env.NODE_ENV === 'production';
    // Clear common auth cookies
    response.cookies.set('token', '', { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 0 });
    response.cookies.set('session', '', { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 0 });
    response.cookies.set('authToken', '', { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 0 });
    return response;
  } catch (err) {
    console.error('Erro em /api/logout:', err);
    return NextResponse.json({ message: 'Erro ao efetuar logout.' }, { status: 500 });
  }
}
