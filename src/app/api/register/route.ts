import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/drizzle";
import { eq, or } from "drizzle-orm";
import { projects, users } from "@/lib/schema";

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
    const exists = await db
      .select({ one: users.id })
      .from(users)
      .where(or(eq(users.login, login), eq(users.email, email)))
      .limit(1);

    if (exists[0]) {
      return NextResponse.json(
        { message: "Login ou e-mail já registrados." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const inserted = await db
      .insert(users)
      .values({ name, login, password: hashedPassword, email })
      .returning({ id: users.id, name: users.name, login: users.login, email: users.email });

    const user = inserted[0];

    // Projeto padrão para o cliente já visualizar no dashboard.
    try {
      await db.insert(projects).values({
        user_id: Number(user.id),
        title: "Seu projeto",
        status: "Em planejamento",
        progress: 0,
      });
    } catch (error) {
      // Não impede cadastro caso a tabela ainda não exista.
      console.error("register: failed to create default project", error);
    }

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
