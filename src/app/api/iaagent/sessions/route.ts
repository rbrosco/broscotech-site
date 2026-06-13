import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { ai_sessions, projects } from '@/lib/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { requireAuth } from '@/lib/middlewareAuth';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    
    let dbSessions: { id: string; project_id: number; title: string; created_at: string | null; updated_at: string | null }[] = [];
    
    // Auth role usually comes from JWT or we can assume if it's admin or just query DB
    // But since we just need to list sessions for clients, let's treat everyone based on their projects
    const isAdmin = (auth as any).role === 'admin';
    
    if (isAdmin) {
      if (projectId) {
        dbSessions = await db.select().from(ai_sessions).where(eq(ai_sessions.project_id, Number(projectId))).orderBy(desc(ai_sessions.created_at));
      } else {
        dbSessions = await db.select().from(ai_sessions).orderBy(desc(ai_sessions.created_at));
      }
    } else {
      // Cliente comum: só vê sessões dos seus próprios projetos
      const userProjects = await db.select({ id: projects.id }).from(projects).where(eq(projects.user_id, Number(auth.id)));
      const projectIds = userProjects.map(p => p.id);
      
      if (projectIds.length > 0) {
        if (projectId && projectIds.includes(Number(projectId))) {
          dbSessions = await db.select().from(ai_sessions).where(eq(ai_sessions.project_id, Number(projectId))).orderBy(desc(ai_sessions.created_at));
        } else {
          dbSessions = await db.select().from(ai_sessions).where(inArray(ai_sessions.project_id, projectIds)).orderBy(desc(ai_sessions.created_at));
        }
      }
    }

    const sessions = dbSessions.map(s => ({
      id: s.id,
      title: s.title,
      projectId: s.project_id,
      updatedAt: s.updated_at || s.created_at
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
    
    const [created] = await db.insert(ai_sessions).values({
      id: newId,
      project_id: Number(body.projectId),
      title: body.title || 'Nova Sessão',
    }).returning();

    const session = {
      id: created.id,
      title: created.title,
      projectId: created.project_id,
      updatedAt: created.updated_at || created.created_at
    };

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return NextResponse.json({ message: 'Erro ao criar sessão' }, { status: 500 });
  }
}
