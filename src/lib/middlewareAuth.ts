import jwt from 'jsonwebtoken';

type DecodedUser = { id?: string | number; name?: string; login?: string; email?: string } | null;

type HeaderLike = { get?(name: string): string | null } | Record<string, string | undefined>;

function parseCookieToken(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) continue;
    const key = rawKey.trim();
    if (key !== 'token') continue;
    const value = rest.join('=');
    return value ? decodeURIComponent(value) : null;
  }
  return null;
}

function getHeader(headers: HeaderLike, name: string): string | null {
  if (!headers) return null;
  if (typeof ((headers as { get?: unknown }).get) === 'function') {
    return (headers as { get(name: string): string | null }).get(name);
  }
  if (typeof headers === 'object') {
    const h = headers as Record<string, string | undefined>;
    return h[name] || h[name.toLowerCase()] || null;
  }
  return null;
}

export function requireAuth(headers: HeaderLike): DecodedUser {
  if (!headers) return null;

  const authHeader = getHeader(headers, 'authorization') || getHeader(headers, 'Authorization');
  const cookieHeader = getHeader(headers, 'cookie') || getHeader(headers, 'Cookie');

  let token: string | null = null;
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0]) && parts[1]) {
      token = parts[1];
    }
  }

  if (!token) {
    token = parseCookieToken(cookieHeader);
  }

  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret) as unknown;
    return (decoded as DecodedUser) || null;
  } catch {
    return null;
  }
}
