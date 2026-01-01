import { NextRequest, NextResponse } from 'next/server';

function extractToken(request: NextRequest) {
  const cookieToken = request.cookies.get('token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return null;
  if (!/^Bearer$/i.test(parts[0])) return null;
  return parts[1];
}

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = typeof atob === 'function' ? atob(padded) : Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(json) as { exp?: number } | null;
    if (!payload || typeof payload.exp !== 'number') return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas protegidas para admin
  const adminRoutes = [
    '/dashboard/iaagent',
    '/dashboard/configuracoes',
    // adicione outras rotas admin aqui
  ];

  // Paths that should redirect to login if not authenticated
  const pageProtected =
    pathname.startsWith('/dashboard') ||
    pathname === '/iaagent' ||
    pathname.startsWith('/iaagent/') ||
    pathname === '/perfil' ||
    pathname.startsWith('/perfil/');

  // API paths that should return 401 if not authenticated
  const apiProtected =
    pathname.startsWith('/api/iaagent') ||
    pathname.startsWith('/api/kanban') ||
    pathname.startsWith('/api/profile');

  if (!pageProtected && !apiProtected) return NextResponse.next();

  const token = extractToken(request);
  if (!token || isJwtExpired(token)) {
    if (pageProtected) return NextResponse.redirect(new URL('/login', request.url));
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  // Protege rotas admin: exige que o token contenha 'admin' (ajuste para JWT real)
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Aqui você deveria consultar o banco/session para validar o papel do usuário
    // Exemplo: decodificar token JWT e checar role === 'admin'
    // (pseudocódigo)
    // const user = decodeToken(token);
    // if (user.role !== 'admin') {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }
    // Para demo, só permite se token contém 'admin'
    if (!token.includes('admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/iaagent',
    '/iaagent/:path*',
    '/perfil',
    '/perfil/:path*',
    '/api/iaagent/:path*',
    '/api/kanban/:path*',
    '/api/profile/:path*',
  ],
};
