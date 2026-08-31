import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { NotificationEntity, ProjectEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    const userId = auth?.id ? Number(auth.id) : null;
    const isAdmin = auth && (auth as { role?: string }).role === 'admin';

    const dataSource = await getDataSource();

    // Se for admin e não passar userId especifico, ele vê todas (ou podemos filtrar)
    let userProjectsIds: number[] = [];

    if (userId && !isAdmin) {
      // Buscar projetos do usuario
      const userProjects = await dataSource.getRepository(ProjectEntity).find({
        select: { id: true },
        where: { user_id: userId },
      });
      userProjectsIds = userProjects.map(p => Number(p.id));
    }

    const list = await dataSource.getRepository(NotificationEntity).find({
      order: { timestamp: 'DESC' },
    });

    // Se for user comum e não tiver projetos, não tem notificações baseadas em projetos
    // (a menos que a notificação tenha user_id setado diretamente)
    const filteredList = list.filter(n => {
      if (isAdmin) return true;
      if (userId && Number(n.user_id) === userId) return true;
      if (n.project_id && userProjectsIds.includes(Number(n.project_id))) return true;
      return false;
    });

    return NextResponse.json({ notifications: filteredList });
  } catch (error: any) {
    if (error?.code !== 'ECONNREFUSED') {
      console.warn('GET /api/notifications:', error?.message || error);
    }
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });

    const body = await request.json();
    const id = String(body.timestamp ?? Date.now()) + '-' + String(Math.random()).slice(2,8);

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(NotificationEntity);
    const created = await repo.save(
      repo.create({
        id,
        message: body.message ?? '',
        card_id: body.cardId ? Number(body.cardId) : null,
        to_column_id: body.toColumnId ? Number(body.toColumnId) : null,
        project_id: body.projectId ? Number(body.projectId) : null,
        user_id: body.userId ? Number(body.userId) : null,
        timestamp: body.timestamp ?? Date.now(),
        read: !!body.read,
      })
    );

    // Retorna com camelCase para manter compatibilidade com o front-end
    return NextResponse.json({
      ok: true,
      item: {
        id: created.id,
        message: created.message,
        cardId: created.card_id,
        toColumnId: created.to_column_id,
        projectId: created.project_id,
        timestamp: created.timestamp,
        read: created.read,
      },
    });
  } catch (error) {
    console.error('Erro POST /api/notifications:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });

    const body = await request.json();
    if (!body.id || !body.updates) {
      return NextResponse.json({ ok: false, message: 'Invalid body' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(NotificationEntity);

    const existing = await repo.findOne({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    }

    await repo.update({ id: body.id }, { read: body.updates.read });
    const updated = await repo.findOneOrFail({ where: { id: body.id } });

    return NextResponse.json({
      ok: true,
      item: {
        id: updated.id,
        message: updated.message,
        cardId: updated.card_id,
        toColumnId: updated.to_column_id,
        projectId: updated.project_id,
        timestamp: updated.timestamp,
        read: updated.read,
      },
    });
  } catch (error) {
    console.error('Erro PATCH /api/notifications:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
