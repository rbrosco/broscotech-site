import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { LeadEntity, NotificationEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';
import { isEvolutionConfigured, getDefaultEvolutionInstance, sendWhatsappText } from '@/lib/evolution';
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit';

const LEAD_ATTEMPTS_PER_IP = 10;
const LEAD_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

/**
 * GET /api/leads — lista os leads captados pelo site (CTAs de Serviços e
 * Portfólio), mais recentes primeiro. Só admin/equipe autenticada vê.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

    const dataSource = await getDataSource();
    const leads = await dataSource.getRepository(LeadEntity).find({
      order: { created_at: 'DESC' },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Erro em GET /api/leads:', error);
    return NextResponse.json({ message: 'Erro interno ao listar leads.' }, { status: 500 });
  }
}

/**
 * POST /api/leads — endpoint PÚBLICO chamado pelo ContactFormModal no
 * site institucional. Registra a escolha exata da pessoa (qual serviço
 * ou qual projeto do portfólio motivou o contato) e, se a Evolution API
 * estiver configurada, avisa a equipe no WhatsApp. Nunca falha por causa
 * do WhatsApp — isso é best-effort.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: endpoint público sem auth, alvo fácil de spam/bot.
    const ip = getClientIp(request.headers);
    const limit = consumeRateLimit(`leads:ip:${ip}`, LEAD_ATTEMPTS_PER_IP, LEAD_WINDOW_MS);
    if (!limit.allowed) {
      return NextResponse.json(
        { message: 'Muitas solicitações. Aguarde um momento e tente novamente.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      );
    }

    const body = await request.json().catch(() => null);
    const { name, phone, email, message, interest_type, interest_id, interest_label } = body ?? {};

    if (!name || !String(name).trim()) {
      return NextResponse.json({ message: 'Nome é obrigatório.' }, { status: 400 });
    }
    if (!phone || !String(phone).trim()) {
      return NextResponse.json({ message: 'Telefone é obrigatório.' }, { status: 400 });
    }
    if (!interest_type || !['service', 'portfolio'].includes(interest_type)) {
      return NextResponse.json({ message: 'interest_type inválido.' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(LeadEntity);

    const created = await repo.save(
      repo.create({
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: email ? String(email).trim() : null,
        message: message ? String(message).trim() : null,
        interest_type,
        interest_id: interest_id ? String(interest_id) : null,
        interest_label: interest_label ? String(interest_label) : null,
        status: 'new',
        created_at: new Date().toISOString(),
      })
    );

    // Notificação interna (aparece no sino do CRM), best-effort.
    try {
      const notifRepo = dataSource.getRepository(NotificationEntity);
      const origem = interest_type === 'portfolio' ? 'portfólio' : 'serviço';
      const notifId = String(Date.now()) + '-' + String(Math.random()).slice(2, 8);
      await notifRepo.save(
        notifRepo.create({
          id: notifId,
          message: `Novo lead: ${created.name} quer "${interest_label || 'um projeto'}" (via ${origem}).`,
          timestamp: Date.now(),
          created_at: new Date().toISOString(),
        })
      );
    } catch (notifyErr) {
      console.error('Falha ao criar notificação de lead (não bloqueante):', notifyErr);
    }

    // WhatsApp para a equipe, best-effort — silencioso se não configurado.
    if (isEvolutionConfigured()) {
      const instance = getDefaultEvolutionInstance();
      const teamPhone = process.env.EVOLUTION_TEAM_PHONE;
      if (instance && teamPhone) {
        const origem = interest_type === 'portfolio' ? 'Portfólio' : 'Serviços';
        const text = [
          '🔔 Novo lead pelo site!',
          `Nome: ${created.name}`,
          `Telefone: ${created.phone}`,
          created.email ? `E-mail: ${created.email}` : null,
          `Interesse (${origem}): ${created.interest_label || '-'}`,
          created.message ? `Mensagem: ${created.message}` : null,
        ]
          .filter(Boolean)
          .join('\n');

        sendWhatsappText({ instance, phone: teamPhone, text }).catch((err) =>
          console.error('Falha ao notificar lead via WhatsApp (não bloqueante):', err)
        );
      }
    }

    return NextResponse.json({ message: 'Recebemos sua solicitação! Em breve entraremos em contato.', lead: { id: created.id } });
  } catch (error) {
    console.error('Erro em POST /api/leads:', error);
    return NextResponse.json({ message: 'Erro interno ao registrar solicitação.' }, { status: 500 });
  }
}
