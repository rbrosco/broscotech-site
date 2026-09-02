import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/jwtSecret';

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

/**
 * Verifica a assinatura e a expiração do token com `jose` (compatível com o
 * Edge Runtime). Antes, este middleware apenas decodificava o payload em
 * base64 sem checar a assinatura — um token com payload adulterado (ex.:
 * role: 'admin') passava sem ser detectado aqui. As rotas de API já faziam
 * a verificação correta via `requireAuth` (jsonwebtoken), mas o middleware
 * era a única barreira para as páginas do dashboard.
 */
async function verifyToken(token: string): Promise<{ role?: string } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
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
    pathname === '/perfil' ||
    pathname.startsWith('/perfil/');

  // API paths that should return 401 if not authenticated
  const apiProtected =
    pathname.startsWith('/api/kanban') ||
    pathname.startsWith('/api/profile');

  if (!pageProtected && !apiProtected) return NextResponse.next();

  const token = extractToken(request);
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    if (pageProtected) return NextResponse.redirect(new URL('/login', request.url));
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  // Protege rotas admin: usa o payload já verificado (assinatura + exp) acima
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/perfil',
    '/perfil/:path*',
    '/api/kanban/:path*',
    '/api/profile/:path*',
  ],
};
