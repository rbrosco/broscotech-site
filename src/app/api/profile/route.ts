import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/drizzle';
import { and, eq, ne, or } from 'drizzle-orm';
import { users } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';

export const runtime = 'nodejs';

type ProfileRow = {
  id: string | number;
  name: string;
  login: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export async function GET(req: Request) {
  const user = requireAuth(req.headers);
  const userId = user?.id ? Number(user.id) : NaN;
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const found = await db
      .select({
        id: users.id,
        name: users.name,
        login: users.login,
        email: users.email,
        phone: users.phone,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const row = found[0] as unknown as ProfileRow | undefined;
    if (!row) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    const profile = {
      id: Number(row.id),
      name: String(row.name),
      login: String(row.login),
      email: String(row.email),
      phone: row.phone ?? null,
      avatar: null, // avatar removido do banco, retorna null
      role: String(row.role),
      created_at: String((row as any).created_at ?? ''),
      updated_at: String((row as any).updated_at ?? ''),
    };
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('[API/profile] profile GET error', error);
    return NextResponse.json({ message: 'Erro ao carregar perfil.' }, { status: 500 });
  }
}

type PatchBody = {
  name?: string;
  login?: string;
  email?: string;
  phone?: string;
  avatar?: string | null; // data URL
  currentPassword?: string;
  newPassword?: string;
};

export async function PATCH(req: Request) {
  const user = requireAuth(req.headers);
  const userId = user?.id ? Number(user.id) : NaN;
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ message: 'JSON inválido.' }, { status: 400 });
  }

  const name = body.name?.trim();
  const login = body.login?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();

  if (!name || !login || !email) {
    return NextResponse.json({ message: 'Nome, login e e-mail são obrigatórios.' }, { status: 400 });
  }

  const wantsPasswordChange = Boolean(body.newPassword || body.currentPassword);
  if (wantsPasswordChange) {
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json({ message: 'Para trocar a senha, informe senha atual e nova senha.' }, { status: 400 });
    }
    if (body.newPassword.length < 6) {
      return NextResponse.json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }
  }

  try {
    const currentArr = await db
      .select({
        id: users.id,
        name: users.name,
        login: users.login,
        email: users.email,
        phone: users.phone,
        password: users.password,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const current = currentArr[0] as
      | { id: number; name: string; login: string; email: string; phone: string | null; password: string }
      | undefined;

    if (!current) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Uniqueness checks
    const conflict = await db
      .select({ id: users.id })
      .from(users)
      .where(and(or(eq(users.login, login), eq(users.email, email)), ne(users.id, userId)))
      .limit(1);
    if (conflict[0]) {
      return NextResponse.json({ message: 'Login ou e-mail já em uso.' }, { status: 409 });
    }

    let newPasswordHash: string | null = null;
    if (wantsPasswordChange) {
      const ok = await bcrypt.compare(body.currentPassword!, current.password);
      if (!ok) {
        return NextResponse.json({ message: 'Senha atual incorreta.' }, { status: 401 });
      }
      newPasswordHash = await bcrypt.hash(body.newPassword!, 10);
    }

    const updatedArr = await db
      .update(users)
      .set({
        name,
        login,
        email,
        phone: phone || null,
        ...(newPasswordHash ? { password: newPasswordHash } : {}),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        login: users.login,
        email: users.email,
        phone: users.phone,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    const row = updatedArr[0] as unknown as ProfileRow | undefined;
    if (!row) {
      return NextResponse.json({ message: 'Erro ao atualizar perfil.' }, { status: 500 });
    }

    const profile = {
      id: Number(row.id),
      name: String(row.name),
      login: String(row.login),
      email: String(row.email),
      phone: row.phone ?? null,
      avatar: null,
      role: String(row.role),
      created_at: String((row as any).created_at ?? ''),
      updated_at: String((row as any).updated_at ?? ''),
    };

    // Refresh JWT cookie so name/login/email stays in sync.
    const tokenPayload = { id: profile.id, name: profile.name, login: profile.login, email: profile.email };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    const res = NextResponse.json({ message: 'Perfil atualizado.', profile }, { status: 200 });
    res.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error('profile PATCH error', error);
    return NextResponse.json({ message: 'Erro ao atualizar perfil.' }, { status: 500 });
  }
}
