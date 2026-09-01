import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import {
  ProjectEntity, ProjectUpdateEntity, KanbanColumnEntity, KanbanCardEntity,
  AiSessionEntity, AiMessageEntity, NotificationEntity, InvoiceEntity,
} from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';
import { In } from 'typeorm';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const body = await request.json();

    const title = (body.title ?? 'Seu Projeto') as string;
    const clientName = (body.clientName ?? null) as string | null;
    const clientEmail = (body.clientEmail ?? null) as string | null;
    const clientPhone = (body.clientPhone ?? null) as string | null;
    const projectType = (body.projectType ?? null) as string | null;
    const finalDate = (body.finalDate ?? null) as string | null;
    const language = (body.language ?? null) as string | null;
    const framework = (body.framework ?? null) as string | null;
    const integrations = (body.integrations ?? null) as string | null;

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(ProjectEntity);

    const created = await repo.save(
      repo.create({
        user_id: userId,
        title,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        project_type: projectType,
        final_date: finalDate,
        language,
        framework,
        integrations,
        progress: 0,
        status: 'Em planejamento',
      })
    );

    return NextResponse.json({ project: created, message: 'Projeto criado.' });
  } catch (error) {
    console.error('Erro em /api/projects POST:', error);
    return NextResponse.json({ message: 'Erro interno ao criar projeto.' }, { status: 500 });
  }
}

async function withUpdates(dataSource: Awaited<ReturnType<typeof getDataSource>>, project: ProjectEntity) {
  const rawUpdates = await dataSource.getRepository(ProjectUpdateEntity).find({
    where: { project_id: project.id },
    order: { created_at: 'DESC' },
  });
  const updates = rawUpdates.map(u => ({
    id: Number(u.id),
    kind: u.kind ?? 'update',
    message: u.message ?? '',
    created_at: u.created_at ?? '',
  }));
  return { ...project, updates };
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const all = url.searchParams.get('all');
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize');

    const userId = Number(auth.id);
    const dataSource = await getDataSource();
    const projectRepo = dataSource.getRepository(ProjectEntity);

    // Se for admin, retorna todos os projetos e todos os updates
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (isAdmin) {
      // Paginação opcional: sem page/pageSize mantém o comportamento antigo
      // (retorna tudo) para não quebrar consumidores existentes (dev/page.tsx
      // e as páginas /dev/* que ainda pedem a lista inteira via ?all=1), mas
      // com um teto de segurança para não deixar a resposta crescer sem
      // limite conforme a base de projetos aumenta. Quem quiser paginar de
      // verdade passa ?page=1&pageSize=20.
      const hasPagination = pageParam !== null || pageSizeParam !== null;
      const pageSize = Math.min(Math.max(Number(pageSizeParam) || 50, 1), 200);
      const page = Math.max(Number(pageParam) || 1, 1);

      if (hasPagination) {
        const [list, total] = await projectRepo.findAndCount({
          order: { updated_at: 'DESC' },
          take: pageSize,
          skip: (page - 1) * pageSize,
        });
        const projectsWithUpdates = await Promise.all(list.map((project) => withUpdates(dataSource, project)));
        return NextResponse.json({
          projects: projectsWithUpdates,
          pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        });
      }

      // Sem paginação explícita: teto de segurança em 500 registros mais
      // recentes, para não devolver a tabela inteira sem limite nenhum.
      const SAFETY_CAP = 500;
      const list = await projectRepo.find({ order: { updated_at: 'DESC' }, take: SAFETY_CAP });
      const projectsWithUpdates = await Promise.all(list.map((project) => withUpdates(dataSource, project)));
      return NextResponse.json({ projects: projectsWithUpdates });
    }

    if (all === '1') {
      const list = await projectRepo.find({ where: { user_id: userId }, order: { updated_at: 'DESC' } });
      const projectsWithUpdates = await Promise.all(list.map((project) => withUpdates(dataSource, project)));
      return NextResponse.json({ projects: projectsWithUpdates });
    }

    const list = await projectRepo.find({
      where: { user_id: userId },
      order: { updated_at: 'DESC' },
      take: 1,
    });

    const project = list[0] ?? null;

    let updates: Array<{ id: number; kind: string; message: string; created_at: string }> = [];
    if (project) {
      const rawUpdates = await dataSource.getRepository(ProjectUpdateEntity).find({
        where: { project_id: project.id },
        order: { created_at: 'DESC' },
      });
      updates = rawUpdates.map(u => ({
        id: Number(u.id),
        kind: u.kind ?? 'update',
        message: u.message ?? '',
        created_at: u.created_at ?? '',
      }));
    }

    return NextResponse.json({ project, updates });
  } catch (error) {
    console.error('Erro em /api/projects GET:', error);
    return NextResponse.json({ message: 'Erro interno ao buscar projetos.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const body = await request.json();
    const projectId = Number(body.id);
    if (!projectId) {
      return NextResponse.json({ message: 'ID do projeto é obrigatório para atualizar.' }, { status: 400 });
    }

    const title = (body.title ?? null) as string | null;
    const clientName = (body.clientName ?? null) as string | null;
    const clientEmail = (body.clientEmail ?? null) as string | null;
    const clientPhone = (body.clientPhone ?? null) as string | null;
    const projectType = (body.projectType ?? null) as string | null;
    const finalDate = (body.finalDate ?? null) as string | null;
    const language = (body.language ?? null) as string | null;
    const framework = (body.framework ?? null) as string | null;
    const integrations = (body.integrations ?? null) as string | null;

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(ProjectEntity);

    const existing = await repo.findOne({ where: { id: projectId, user_id: userId } });
    if (!existing) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    const patch: Partial<ProjectEntity> = { updated_at: new Date().toISOString() };
    if (title !== null) patch.title = title;
    if (clientName !== null) patch.client_name = clientName;
    if (clientEmail !== null) patch.client_email = clientEmail;
    if (clientPhone !== null) patch.client_phone = clientPhone;
    if (projectType !== null) patch.project_type = projectType;
    if (finalDate !== null) patch.final_date = finalDate;
    if (language !== null) patch.language = language;
    if (framework !== null) patch.framework = framework;
    if (integrations !== null) patch.integrations = integrations;

    await repo.update({ id: projectId, user_id: userId }, patch);
    const updated = await repo.findOneOrFail({ where: { id: projectId } });

    return NextResponse.json({ project: updated, message: 'Projeto atualizado.' });
  } catch (error) {
    console.error('Erro em /api/projects PATCH:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar projeto.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const isAdmin = ((auth as { role?: string }).role === 'admin');

    const url = new URL(request.url);
    const projectIdParam = url.searchParams.get('projectId');
    const body = await request.json().catch(() => ({}));
    const projectId = Number(projectIdParam || body.id || body.projectId);

    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ message: 'ID do projeto é obrigatório.' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const projectRepo = dataSource.getRepository(ProjectEntity);

    // Busca o projeto para verificar permissão
    const project = await projectRepo.findOne({ where: { id: projectId } });

    if (!project) {
      return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
    }

    if (!isAdmin && Number(project.user_id) !== userId) {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    // Excluir registros vinculados em ordem de dependência (com try/catch por tabela)
    try {
      const sessionRepo = dataSource.getRepository(AiSessionEntity);
      const sessions = await sessionRepo.find({ select: { id: true }, where: { project_id: projectId } });
      const sessionIds = sessions.map(s => s.id);
      if (sessionIds.length > 0) {
        await dataSource.getRepository(AiMessageEntity).delete({ session_id: In(sessionIds) });
      }
      await sessionRepo.delete({ project_id: projectId });
    } catch {}

    try {
      const columnRepo = dataSource.getRepository(KanbanColumnEntity);
      const cols = await columnRepo.find({ select: { id: true }, where: { project_id: projectId } });
      const colIds = cols.map(c => Number(c.id));
      if (colIds.length > 0) {
        await dataSource.getRepository(KanbanCardEntity).delete({ column_id: In(colIds) });
      }
      await columnRepo.delete({ project_id: projectId });
    } catch {}

    try { await dataSource.getRepository(ProjectUpdateEntity).delete({ project_id: projectId }); } catch {}
    try { await dataSource.getRepository(NotificationEntity).delete({ project_id: projectId }); } catch {}
    try { await dataSource.getRepository(InvoiceEntity).delete({ project_id: projectId }); } catch {}

    // 4. projeto
    await projectRepo.delete({ id: projectId });

    return NextResponse.json({ message: 'Projeto excluído com sucesso.' });
  } catch (error) {
    console.error('Erro em /api/projects DELETE:', error);
    return NextResponse.json({ message: 'Erro interno ao excluir projeto.' }, { status: 500 });
  }
}
