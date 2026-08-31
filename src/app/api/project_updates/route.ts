import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { ProjectUpdateEntity, ProjectEntity, NotificationEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const isAdmin = ((auth as { role?: string }).role === 'admin');
    const { searchParams } = new URL(request.url);
    const projectId = Number(searchParams.get('projectId') ?? NaN);

    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ message: 'projectId inválido.' }, { status: 400 });
    }

    const dataSource = await getDataSource();

    const owner = await dataSource.getRepository(ProjectEntity).findOne({
      select: { user_id: true },
      where: { id: projectId },
    });

    if (!owner || (!isAdmin && Number(owner.user_id) !== Number(auth.id))) {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });
    }

    const updates = await dataSource.getRepository(ProjectUpdateEntity).find({
      where: { project_id: projectId },
      order: { created_at: 'DESC' },
    });

    return NextResponse.json({ updates });
  } catch (error) {
    console.error('Erro em /api/project_updates GET:', error);
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const projectId = Number(body.projectId ?? NaN);
    const userId = Number(body.userId ?? Number(auth.id));
    const kind = (body.kind as string | undefined) || 'update';
    const message = String(body.message ?? '');
    const isAdmin = ((auth as { role?: string }).role === 'admin');

    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const projectRepo = dataSource.getRepository(ProjectEntity);
    const updateRepo = dataSource.getRepository(ProjectUpdateEntity);
    const notificationRepo = dataSource.getRepository(NotificationEntity);

    const owner = await projectRepo.findOne({ select: { user_id: true }, where: { id: projectId } });

    // Admins can post to any project
    if (!owner || (!isAdmin && (Number(owner.user_id) !== userId || Number(auth.id) !== userId))) {
      return NextResponse.json({ message: 'Não autorizado a atualizar este projeto.' }, { status: 403 });
    }

    const created = await updateRepo.save(
      updateRepo.create({ project_id: projectId, kind, message })
    );

    // Criar notificação correspondente
    try {
      const notifId = String(Date.now()) + '-' + String(Math.random()).slice(2,8);
      let notifMsg = '';
      if (kind === 'status_change') {
        notifMsg = `Status do projeto alterado para: ${message}`;
      } else if (kind === 'progress_change') {
        notifMsg = `Progresso do projeto atualizado para: ${message}%`;
      } else {
        let extractedMessage = message;
        if (message.startsWith('{')) {
          try {
            const parsed = JSON.parse(message);
            if (parsed.texto) extractedMessage = parsed.texto;
          } catch (e) {}
        }
        notifMsg = `Nova atualização no projeto: ${extractedMessage}`;
      }

      await notificationRepo.save(
        notificationRepo.create({
          id: notifId,
          project_id: projectId,
          message: notifMsg,
          timestamp: Date.now(),
          read: false,
        })
      );
    } catch (e) {
      console.error('Erro ao criar notificação do project_update:', e);
    }

    return NextResponse.json({ update: created, message: 'Atualização registrada.' });
  } catch (error) {
    console.error('Erro em /api/project_updates POST:', error);
    return NextResponse.json({ message: 'Erro interno ao criar atualização.' }, { status: 500 });
  }
}
