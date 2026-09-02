import { NextResponse, NextRequest } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { InvoiceEntity, ProjectEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';
import { findOrCreateAsaasCustomer, createAsaasPayment, isAsaasConfigured } from '@/lib/asaas';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const isAdmin = ((auth as { role?: string }).role === 'admin');
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    const dataSource = await getDataSource();
    const qb = dataSource
      .getRepository(InvoiceEntity)
      .createQueryBuilder('invoice')
      .leftJoin(ProjectEntity, 'project', 'project.id = invoice.project_id')
      .select([
        'invoice.id AS id',
        'invoice.project_id AS project_id',
        'project.title AS projeto',
        'invoice.client_name AS cliente',
        'invoice.value AS valor',
        'invoice.issue_date AS emissao',
        'invoice.due_date AS vencimento',
        'invoice.status AS status',
        'invoice.description AS descricao',
        'invoice.asaas_url AS asaas_url',
      ])
      .orderBy('invoice.created_at', 'DESC');

    if (projectId) {
      qb.where('invoice.project_id = :projectId', { projectId: Number(projectId) });
      if (!isAdmin) qb.andWhere('project.user_id = :userId', { userId: Number(auth.id) });
    } else if (!isAdmin) {
      qb.where('project.user_id = :userId', { userId: Number(auth.id) });
    }

    const list = await qb.getRawMany();

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
    const {
      project_id, client_name, value, issue_date, due_date, status, description,
      client_document, client_email, client_phone,
    } = body;

    // Auto-generate an ID if none provided
    const id = body.id || `FAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Gera cobrança automática no Asaas quando o servidor está configurado
    // (ASAAS_API_KEY) e o admin informou o CPF/CNPJ do cliente. Caso
    // contrário, cai de volta no link colado manualmente (asaas_url do
    // corpo da requisição) — mesmo comportamento de antes.
    let asaasCustomerId: string | null = null;
    let asaasId: string | null = null;
    let asaasUrl: string | null = body.asaas_url || null;
    let asaasWarning: string | null = null;

    if (isAsaasConfigured() && client_document) {
      try {
        const customer = await findOrCreateAsaasCustomer({
          name: client_name || 'Desconhecido',
          cpfCnpj: client_document,
          email: client_email || undefined,
          phone: client_phone || undefined,
        });
        const payment = await createAsaasPayment({
          customerId: customer.id,
          value: Number(value),
          dueDate: due_date,
          description: description || undefined,
          externalReference: id,
        });
        asaasCustomerId = customer.id;
        asaasId = payment.id;
        asaasUrl = payment.invoiceUrl;
      } catch (asaasError) {
        // Não bloqueia a criação da fatura por causa de uma falha no Asaas —
        // salva sem o link automático e avisa o admin para configurar manualmente.
        console.error('Asaas integration error:', asaasError);
        asaasWarning = asaasError instanceof Error ? asaasError.message : 'Falha ao gerar cobrança no Asaas.';
      }
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(InvoiceEntity);
    await repo.save(
      repo.create({
        id,
        project_id: project_id ? Number(project_id) : null,
        client_name: client_name || 'Desconhecido',
        client_document: client_document || null,
        client_email: client_email || null,
        client_phone: client_phone || null,
        value: Number(value),
        issue_date,
        due_date,
        status: status || 'pendente',
        description,
        asaas_customer_id: asaasCustomerId,
        asaas_id: asaasId,
        asaas_url: asaasUrl,
      })
    );

    return NextResponse.json({ success: true, id, asaas_url: asaasUrl, asaas_warning: asaasWarning });
  } catch (error) {
    console.error('Invoices POST Error:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
