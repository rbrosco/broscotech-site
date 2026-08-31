
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDataSource } from '@/lib/typeorm';
import { UserEntity } from '@/lib/entities';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, login, email, password, phone } = body ?? {};

    if (!name || !login || !email || !password) {
      return NextResponse.json({ message: 'Nome, login, e-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(UserEntity);

    const existing = await repo.findOne({ where: [{ login }, { email }] });
    if (existing) {
      return NextResponse.json({ message: 'Login ou e-mail já cadastrado.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await repo.save(
      repo.create({
        name,
        login,
        email,
        password: passwordHash,
        phone: phone || null,
        role: 'user',
      })
    );

    return NextResponse.json({
      message: 'Usuário criado com sucesso.',
      user: { id: created.id, name: created.name, login: created.login, email: created.email },
    });
  } catch (error) {
    console.error('Erro em /api/register:', error);
    return NextResponse.json({ message: 'Erro interno ao registrar usuário.' }, { status: 500 });
  }
}
