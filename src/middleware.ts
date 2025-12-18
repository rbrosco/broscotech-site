import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard and subroutes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};