import { NextResponse, NextRequest } from 'next/server';
import { db } from '../../../lib/drizzle';
import { invoices, projects } from '../../../lib/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/middlewareAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    let list;
    const baseQuery = db.select({
      id: invoices.id,
      project_id: invoices.project_id,
      projeto: projects.title,
      cliente: invoices.client_name,
      valor: invoices.value,
      emissao: invoices.issue_date,
      vencimento: invoices.due_date,
      status: invoices.status,
      descricao: invoices.description,
      asaas_url: invoices.asaas_url,
    })
    .from(invoices)
    .leftJoin(projects, eq(invoices.project_id, projects.id));

    if (projectId) {
      if (isAdmin) {
        list = await baseQuery
          .where(eq(invoices.project_id, Number(projectId)))
          .orderBy(desc(invoices.created_at));
      } else {
        list = await baseQuery
          .where(and(eq(invoices.project_id, Number(projectId)), eq(projects.user_id, Number(auth.id))))
          .orderBy(desc(invoices.created_at));
      }
    } else {
      if (isAdmin) {
        list = await baseQuery.orderBy(desc(invoices.created_at));
      } else {
        list = await baseQuery
          .where(eq(projects.user_id, Number(auth.id)))
          .orderBy(desc(invoices.created_at));
      }
    }

    return NextResponse.json({ invoices: list });
  } catch (error) {
    console.error('Invoices GET Error:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) return NextResponse.json({ message: 'Não autorizado.' }, { status: 403 });

    const body = await req.json();
    const { project_id, client_name, value, issue_date, due_date, status, description, asaas_url } = body;
    
    // Auto-generate an ID if none provided
    const id = body.id || `FAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.insert(invoices).values({
      id,
      project_id: project_id ? Number(project_id) : null,
      client_name: client_name || 'Desconhecido',
      value: Number(value),
      issue_date,
      due_date,
      status: status || 'pendente',
      description,
      asaas_url,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Invoices POST Error:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
