import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { eq, and, not } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });

    const targetId = Number(params.id);
    if (!Number.isFinite(targetId)) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

    const body = await request.json();
    const { name, login, email, password, phone, role } = body ?? {};

    const existing = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
    if (existing.length === 0) return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });

    const updateData: any = {};
    if (name) updateData.name = name;
    if (login) updateData.login = login;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, targetId));
    }

    return NextResponse.json({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro em PUT /api/users/[id]:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar usuário.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });

    const targetId = Number(params.id);
    if (!Number.isFinite(targetId)) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

    if (Number(auth.id) === targetId) {
      return NextResponse.json({ message: 'Não é possível excluir sua própria conta.' }, { status: 403 });
    }

    await db.delete(users).where(eq(users.id, targetId));

    return NextResponse.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro em DELETE /api/users/[id]:', error);
    return NextResponse.json({ message: 'Erro interno ao excluir usuário.' }, { status: 500 });
  }
}
