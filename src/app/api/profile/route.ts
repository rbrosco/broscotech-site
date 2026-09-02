import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { UserEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const dataSource = await getDataSource();
    const row = await dataSource.getRepository(UserEntity).findOne({ where: { id: userId } });
    if (!row) {
      return NextResponse.json({ message: 'Perfil não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: row.id,
        name: row.name,
        login: row.login,
        email: row.email,
        phone: row.phone ?? null,
        role: row.role ?? 'user',
        avatar: null,
        created_at: row.created_at ?? null,
        updated_at: row.updated_at ?? null,
      },
    });
  } catch (error) {
    console.error('Erro em /api/profile GET:', error);
    return NextResponse.json({ message: 'Erro interno ao buscar perfil.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const body = await request.json();
    const { name, login, email, phone, currentPassword, newPassword } = body ?? {};

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(UserEntity);
    const row = await repo.findOne({ where: { id: userId } });
    if (!row) {
      return NextResponse.json({ message: 'Perfil não encontrado.' }, { status: 404 });
    }

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ message: 'Informe a senha atual e a nova senha.' }, { status: 400 });
      }
      const ok = await bcrypt.compare(currentPassword, row.password);
      if (!ok) {
        return NextResponse.json({ message: 'Senha atual incorreta.' }, { status: 400 });
      }
    }

    // Garante que login/email não colidam com outro usuário antes de salvar
    if (typeof login === 'string' || typeof email === 'string') {
      const conflict = await repo.findOne({
        where: [
          ...(typeof login === 'string' ? [{ login }] : []),
          ...(typeof email === 'string' ? [{ email }] : []),
        ],
      });
      if (conflict && conflict.id !== userId) {
        return NextResponse.json({ message: 'Login ou e-mail já cadastrado para outro usuário.' }, { status: 409 });
      }
    }

    const updateData: Partial<UserEntity> = {};
    if (typeof name === 'string') updateData.name = name;
    if (typeof login === 'string') updateData.login = login;
    if (typeof email === 'string') updateData.email = email;
    if (typeof phone === 'string') updateData.phone = phone;
    if (currentPassword && newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'Nada para atualizar.' });
    }

    await repo.update({ id: userId }, { ...updateData, updated_at: new Date().toISOString() });
    const updated = await repo.findOneOrFail({ where: { id: userId } });

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso.',
      profile: {
        id: updated.id,
        name: updated.name,
        login: updated.login,
        email: updated.email,
        phone: updated.phone ?? null,
        role: updated.role ?? 'user',
        avatar: null,
        created_at: updated.created_at ?? null,
        updated_at: updated.updated_at ?? null,
      },
    });
  } catch (error) {
    console.error('Erro em /api/profile PATCH:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar perfil.' }, { status: 500 });
  }
}
