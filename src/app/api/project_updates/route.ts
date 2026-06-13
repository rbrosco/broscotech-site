import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { project_updates, projects, notifications } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { eq, desc } from 'drizzle-orm';

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

    const owner = await db
      .select({ user_id: projects.user_id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!owner[0] || (!isAdmin && Number(owner[0].user_id) !== Number(auth.id))) {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });
    }

    const updates = await db
      .select()
      .from(project_updates)
      .where(eq(project_updates.project_id, projectId))
      .orderBy(desc(project_updates.created_at));

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

    const owner = await db
      .select({ user_id: projects.user_id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    // Admins can post to any project
    if (!owner[0] || (!isAdmin && (Number(owner[0].user_id) !== userId || Number(auth.id) !== userId))) {
      return NextResponse.json({ message: 'Não autorizado a atualizar este projeto.' }, { status: 403 });
    }

    const [created] = await db
      .insert(project_updates)
      .values({ project_id: projectId, kind, message })
      .returning();

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
      
      await db.insert(notifications).values({
        id: notifId,
        project_id: projectId,
        message: notifMsg,
        timestamp: Date.now(),
        read: false
      });
    } catch (e) {
      console.error('Erro ao criar notificação do project_update:', e);
    }

    return NextResponse.json({ update: created, message: 'Atualização registrada.' });
  } catch (error) {
    console.error('Erro em /api/project_updates POST:', error);
    return NextResponse.json({ message: 'Erro interno ao criar atualização.' }, { status: 500 });
  }
}
