import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewareAuth';

export async function GET(request: Request) {
  const user = requireAuth(request.headers as unknown as { get(name: string): string | null });
  if (!user || !user.id) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  // Garante que Rogger Brosco sempre é admin
  let role = (user as any).role ?? null;
  if (user.email === "rogger.brosco@easydev.com.br") {
    role = "admin";
  }
  // Sempre retorna avatar (null se não houver)
  return NextResponse.json({
    id: user.id,
    name: user.name,
    login: user.login,
    email: user.email,
    role,
    avatar: (user as { avatar?: string | null }).avatar ?? null,
  });
}
