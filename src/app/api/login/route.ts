import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/drizzle";
import { or, eq } from "drizzle-orm";
import { users } from "@/lib/schema";

export const runtime = "nodejs";

type LoginBody = {
  identifier?: string;
  password?: string;
};

export async function POST(req: Request) {
  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const identifier = body.identifier?.trim();
  const password = body.password;

  if (!identifier || !password) {
    return NextResponse.json(
      { message: "Por favor, preencha todos os campos." },
      { status: 400 }
    );
  }

  try {
    const found = await db
      .select({ id: users.id, name: users.name, login: users.login, email: users.email, password: users.password })
      .from(users)
      .where(or(eq(users.login, identifier), eq(users.email, identifier)))
      .limit(1);
    const userRow = found[0];

    if (!userRow) {
      return NextResponse.json(
        { message: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, userRow.password);
    if (!ok) {
      return NextResponse.json(
        { message: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      login: userRow.login,
      email: userRow.email,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '7d' });

    const response = NextResponse.json(
      { message: "Login bem-sucedido.", user, token },
      { status: 200 }
    );

    // Server-set cookie so middleware can protect /dashboard without relying on localStorage.
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("login error", error);
    return NextResponse.json(
      { message: "Erro ao conectar com o servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "Método não permitido" }, { status: 405 });
}
