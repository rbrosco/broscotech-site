import jwt from 'jsonwebtoken';

type DecodedUser = { id?: string | number; name?: string; login?: string; email?: string } | null;

type HeaderLike = { get?(name: string): string | null } | Record<string, string | undefined>;

export function requireAuth(headers: HeaderLike): DecodedUser {
  if (!headers) return null;

  let authHeader: string | null | undefined = null;

  if (typeof ((headers as { get?: unknown }).get) === 'function') {
    authHeader = (headers as { get(name: string): string | null }).get('authorization') || (headers as { get(name: string): string | null }).get('Authorization');
  } else if (typeof headers === 'object') {
    const h = headers as Record<string, string | undefined>;
    authHeader = h.authorization || h.Authorization || h['Authorization'] || h['authorization'];
  }

  if (!authHeader || typeof authHeader !== 'string') return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme) || !token) return null;

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret) as unknown;
    return (decoded as DecodedUser) || null;
  } catch {
    return null;
  }
}
