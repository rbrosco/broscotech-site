import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '@/lib/db';
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
    console.log('[API/profile] userId extraído do token:', userId);
    const result = await getPool().query(
      'SELECT id, name, login, email, phone, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );
    console.log('[API/profile] result.rows:', result.rows);

    const row = result.rows[0] as ProfileRow | undefined;
    if (!row) {
      console.log('[API/profile] Usuário não encontrado para userId:', userId);
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
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    };
    console.log('[API/profile] profile retornado:', profile);
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
    // Load current user (for password check)
    const currentRes = await getPool().query(
      'SELECT id, name, login, email, phone, password FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );

    const current = currentRes.rows[0] as
      | { id: string | number; name: string; login: string; email: string; phone: string | null; password: string }
      | undefined;

    if (!current) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Uniqueness checks
    const conflict = await getPool().query(
      'SELECT id FROM users WHERE (login = $1 OR email = $2) AND id <> $3 LIMIT 1',
      [login, email, userId]
    );
    if (conflict.rowCount) {
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

    const updated = await getPool().query(
      'UPDATE users SET name = $1, login = $2, email = $3, phone = $4, avatar = COALESCE($5, avatar), password = COALESCE($6, password), updated_at = now() WHERE id = $7 RETURNING id, name, login, email, phone, avatar, role, created_at, updated_at',
      [name, login, email, phone || null, body.avatar ?? null, newPasswordHash, userId]
    );

    const row = updated.rows[0] as ProfileRow | undefined;
    if (!row) {
      return NextResponse.json({ message: 'Erro ao atualizar perfil.' }, { status: 500 });
    }

    const profile = {
      id: Number(row.id),
      name: String(row.name),
      login: String(row.login),
      email: String(row.email),
      phone: row.phone ?? null,
      avatar: row.avatar ?? null,
      role: String(row.role),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
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
