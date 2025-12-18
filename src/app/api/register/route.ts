import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

type RegisterBody = {
  name?: string;
  login?: string;
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const name = body.name?.trim();
  const login = body.login?.trim();
  const email = body.email?.trim();
  const password = body.password;

  if (!name || !login || !email || !password) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const existsResult = await getPool().query(
      "SELECT 1 FROM users WHERE login = $1 OR email = $2 LIMIT 1",
      [login, email]
    );

    if (existsResult.rowCount && existsResult.rowCount > 0) {
      return NextResponse.json(
        { message: "Login ou e-mail já registrados." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await getPool().query(
      "INSERT INTO users (name, login, password, email) VALUES ($1, $2, $3, $4) RETURNING id, name, login, email",
      [name, login, hashedPassword, email]
    );

    const user = insertResult.rows[0];
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("register error", error);
    return NextResponse.json(
      { message: "Erro ao criar usuário." },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "Método não permitido" }, { status: 405 });
}
