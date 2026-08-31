import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { notifications, projects } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { eq, desc, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    const userId = auth?.id ? Number(auth.id) : null;
    const isAdmin = auth && (auth as { role?: string }).role === 'admin';

    // Se for admin e não passar userId especifico, ele vê todas (ou podemos filtrar)
    let userProjectsIds: number[] = [];
    
    if (userId && !isAdmin) {
      // Buscar projetos do usuario
      const userProjects = await db.select({ id: projects.id }).from(projects).where(eq(projects.user_id, userId));
      userProjectsIds = userProjects.map(p => Number(p.id));
    }

    let query = db.select().from(notifications).orderBy(desc(notifications.timestamp));
    
    // Se for user comum e não tiver projetos, não tem notificações baseadas em projetos
    // (a menos que a notificação tenha user_id setado diretamente)
    
    const list = await query;
    
    const filteredList = list.filter(n => {
      if (isAdmin) return true;
      if (userId && Number(n.user_id) === userId) return true;
      if (n.project_id && userProjectsIds.includes(Number(n.project_id))) return true;
      return false;
    });

    return NextResponse.json({ notifications: filteredList });
  } catch (error) {
    console.error('Erro GET /api/notifications:', error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });

    const body = await request.json();
    const id = String(body.timestamp ?? Date.now()) + '-' + String(Math.random()).slice(2,8);
    const item = { 
      id, 
      message: body.message ?? '', 
      card_id: body.cardId ? Number(body.cardId) : null, 
      to_column_id: body.toColumnId ? Number(body.toColumnId) : null, 
      project_id: body.projectId ? Number(body.projectId) : null,
      user_id: body.userId ? Number(body.userId) : null,
      timestamp: body.timestamp ?? Date.now(), 
      read: !!body.read 
    };
    
    const [created] = await db.insert(notifications).values(item).returning();
    
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
        read: created.read
      } 
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
    
    const [updated] = await db.update(notifications)
      .set({ read: body.updates.read })
      .where(eq(notifications.id, body.id))
      .returning();
      
    if (!updated) {
      return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      ok: true, 
      item: {
        id: updated.id,
        message: updated.message,
        cardId: updated.card_id,
        toColumnId: updated.to_column_id,
        projectId: updated.project_id,
        timestamp: updated.timestamp,
        read: updated.read
      }  
    });
  } catch (error) {
    console.error('Erro PATCH /api/notifications:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
