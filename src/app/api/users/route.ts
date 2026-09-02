import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { UserEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');

    const dataSource = await getDataSource();
    // Mapear users com senha omitida
    const allUsers = await dataSource.getRepository(UserEntity).find({
      select: { id: true, name: true, login: true, email: true, phone: true, role: true, created_at: true },
      order: { created_at: 'DESC' },
    });

    let filtered = allUsers;
    if (roleFilter === 'client') {
      filtered = allUsers.filter(u => u.role === 'client' || u.role === 'user');
    } else if (roleFilter === 'team') {
      filtered = allUsers.filter(u => u.role !== 'client' && u.role !== 'user');
    }

    return NextResponse.json({ users: filtered });
  } catch (error) {
    console.error('Erro em GET /api/users:', error);
    return NextResponse.json({ message: 'Erro interno ao listar usuários.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });

    const body = await request.json();
    const { name, login, email, password, phone, role } = body ?? {};

    if (!name || !login || !email || !password || !role) {
      return NextResponse.json({ message: 'Campos obrigatórios ausentes.' }, { status: 400 });
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
        role,
      })
    );

    return NextResponse.json({
      message: 'Usuário criado com sucesso.',
      user: { id: created.id, name: created.name, login: created.login, email: created.email, role: created.role },
    });
  } catch (error) {
    console.error('Erro em POST /api/users:', error);
    return NextResponse.json({ message: 'Erro interno ao criar usuário.' }, { status: 500 });
  }
}
