import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { AiSessionEntity, ProjectEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';
import { randomUUID } from 'crypto';
import { In } from 'typeorm';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    const dataSource = await getDataSource();
    const sessionRepo = dataSource.getRepository(AiSessionEntity);

    let dbSessions: AiSessionEntity[] = [];

    // Auth role usually comes from JWT or we can assume if it's admin or just query DB
    // But since we just need to list sessions for clients, let's treat everyone based on their projects
    const isAdmin = (auth as any).role === 'admin';

    if (isAdmin) {
      if (projectId) {
        dbSessions = await sessionRepo.find({ where: { project_id: Number(projectId) }, order: { created_at: 'DESC' } });
      } else {
        dbSessions = await sessionRepo.find({ order: { created_at: 'DESC' } });
      }
    } else {
      // Cliente comum: só vê sessões dos seus próprios projetos
      const userProjects = await dataSource.getRepository(ProjectEntity).find({
        select: { id: true },
        where: { user_id: Number(auth.id) },
      });
      const projectIds = userProjects.map(p => p.id);

      if (projectIds.length > 0) {
        if (projectId && projectIds.includes(Number(projectId))) {
          dbSessions = await sessionRepo.find({ where: { project_id: Number(projectId) }, order: { created_at: 'DESC' } });
        } else {
          dbSessions = await sessionRepo.find({ where: { project_id: In(projectIds) }, order: { created_at: 'DESC' } });
        }
      }
    }

    const sessions = dbSessions.map(s => ({
      id: s.id,
      title: s.title,
      projectId: s.project_id,
      updatedAt: s.updated_at || s.created_at,
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    return NextResponse.json({ message: 'Erro ao listar sessões' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const body = await request.json();
    if (!body.projectId) return NextResponse.json({ message: 'O ID do projeto é obrigatório.' }, { status: 400 });

    const newId = randomUUID();

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(AiSessionEntity);
    const created = await repo.save(
      repo.create({
        id: newId,
        project_id: Number(body.projectId),
        title: body.title || 'Nova Sessão',
      })
    );

    const session = {
      id: created.id,
      title: created.title,
      projectId: created.project_id,
      updatedAt: created.updated_at || created.created_at,
    };

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return NextResponse.json({ message: 'Erro ao criar sessão' }, { status: 500 });
  }
}
