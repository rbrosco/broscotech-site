import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

  try {
    jwt.verify(token, process.env.JWT_SECRET! || 'dev-secret');
  } catch (e) {
    if (pageProtected) return NextResponse.redirect(new URL('/login', request.url));
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/iaagent', '/iaagent/:path*', '/api/iaagent/:path*', '/api/kanban/:path*'],
};
