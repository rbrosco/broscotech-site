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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that should redirect to login if not authenticated
  const pageProtected = pathname.startsWith('/dashboard') || pathname === '/iaagent' || pathname.startsWith('/iaagent/');

  // API paths that should return 401 if not authenticated
  const apiProtected = pathname.startsWith('/api/iaagent') || pathname.startsWith('/api/kanban');

  if (!pageProtected && !apiProtected) return NextResponse.next();

  const token = extractToken(request);
  if (!token) {
    if (pageProtected) return NextResponse.redirect(new URL('/login', request.url));
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  // Lightweight token validation for middleware (Edge runtime): decode payload and check `exp`.
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('invalid');
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const parsed: unknown = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    const decoded = (typeof parsed === 'object' && parsed !== null) ? parsed as { exp?: number } : null;
    if (decoded && decoded.exp && typeof decoded.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) throw new Error('expired');
    }
  } catch {
    if (pageProtected) return NextResponse.redirect(new URL('/login', request.url));
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/iaagent', '/iaagent/:path*', '/api/iaagent/:path*', '/api/kanban/:path*'],
};
