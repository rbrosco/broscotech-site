import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPool } from "@/lib/db";

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
    const userResult = await getPool().query(
      "SELECT id, name, login, email, password FROM users WHERE login = $1 OR email = $1 LIMIT 1",
      [identifier]
    );

    const userRow = userResult.rows[0] as
      | { id: string | number; name: string; login: string; email: string; password: string }
      | undefined;

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

    return NextResponse.json(
      { message: "Login bem-sucedido.", user, token },
      { status: 200 }
    );
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
