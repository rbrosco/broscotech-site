import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { UserEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });

    const targetId = Number(id);
    if (!Number.isFinite(targetId)) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

    const body = await request.json();
    const { name, login, email, password, phone, role } = body ?? {};

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(UserEntity);

    const existing = await repo.findOne({ where: { id: targetId } });
    if (!existing) return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });

    // Garante que login/email não colidam com outro usuário antes de salvar
    if (login || email) {
      const conflict = await repo.findOne({
        where: [
          ...(login ? [{ login }] : []),
          ...(email ? [{ email }] : []),
        ],
      });
      if (conflict && conflict.id !== targetId) {
        return NextResponse.json({ message: 'Login ou e-mail já cadastrado para outro usuário.' }, { status: 409 });
      }
    }

    const updateData: Partial<UserEntity> = {};
    if (name) updateData.name = name;
    if (login) updateData.login = login;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await repo.update({ id: targetId }, updateData);
    }

    return NextResponse.json({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro em PUT /api/users/[id]:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar usuário.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });

    const targetId = Number(id);
    if (!Number.isFinite(targetId)) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

    if (Number(auth.id) === targetId) {
      return NextResponse.json({ message: 'Não é possível excluir sua própria conta.' }, { status: 403 });
    }

    const dataSource = await getDataSource();
    await dataSource.getRepository(UserEntity).delete({ id: targetId });

    return NextResponse.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro em DELETE /api/users/[id]:', error);
    return NextResponse.json({ message: 'Erro interno ao excluir usuário.' }, { status: 500 });
  }
}
