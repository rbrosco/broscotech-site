import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { ProjectEntity, ProjectUpdateEntity, NotificationEntity } from '@/lib/entities';
import { parseEvolutionWebhookMessage, normalizePhoneForWhatsapp, getEvolutionInstances } from '@/lib/evolution';

/**
 * Webhook da Evolution API — chamado por ela sempre que uma nova mensagem
 * chega numa instância (evento `messages.upsert`), incluindo respostas de
 * clientes no WhatsApp. Configurar no painel/instância da Evolution:
 *   URL: https://SEU_DOMINIO/api/webhooks/evolution/{instance}
 *   Eventos: MESSAGES_UPSERT
 *
 * A rota é pública (a Evolution não manda JWT do nosso sistema) — a
 * validação é: (1) nome de instância precisa estar em EVOLUTION_INSTANCES,
 * (2) o telefone remetente precisa bater com um client_phone de projeto
 * cadastrado. Mensagens de números desconhecidos são ignoradas (200 OK,
 * sem persistir nada) para não virar canal de spam externo.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ instance: string }> }) {
  try {
    const { instance } = await params;

    const knownInstances = getEvolutionInstances();
    if (knownInstances.length > 0 && !knownInstances.includes(instance)) {
      // Instância não reconhecida — responde 200 para a Evolution não ficar re-tentando, mas não faz nada.
      return NextResponse.json({ ok: true, ignored: true });
    }

    const body = await request.json().catch(() => null);
    const parsed = body ? parseEvolutionWebhookMessage(body) : null;
    if (!parsed) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const normalizedIncoming = normalizePhoneForWhatsapp(parsed.phone);
    if (!normalizedIncoming) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const dataSource = await getDataSource();
    const projectRepo = dataSource.getRepository(ProjectEntity);

    // Encontra o(s) projeto(s) cujo client_phone normalizado bate com o remetente.
    const candidates = await projectRepo.find({ where: {} });
    const matching = candidates.filter((p) => {
      if (!p.client_phone) return false;
      return normalizePhoneForWhatsapp(p.client_phone) === normalizedIncoming;
    });

    if (matching.length === 0) {
      // Número não corresponde a nenhum cliente cadastrado — ignora silenciosamente.
      return NextResponse.json({ ok: true, ignored: true, reason: 'phone_not_matched' });
    }

    const updateRepo = dataSource.getRepository(ProjectUpdateEntity);
    const notificationRepo = dataSource.getRepository(NotificationEntity);

    for (const project of matching) {
      await updateRepo.save(
        updateRepo.create({
          project_id: project.id,
          kind: 'whatsapp',
          message: parsed.text,
        })
      );

      const notifId = String(Date.now()) + '-' + String(Math.random()).slice(2, 8);
      await notificationRepo.save(
        notificationRepo.create({
          id: notifId,
          project_id: project.id,
          message: `💬 ${parsed.pushName || project.client_name || 'Cliente'} respondeu no WhatsApp (${project.title}): ${parsed.text.slice(0, 120)}`,
          timestamp: Date.now(),
          read: false,
        })
      );
    }

    return NextResponse.json({ ok: true, projectsUpdated: matching.map((p) => p.id) });
  } catch (error) {
    console.error('Erro no webhook Evolution:', error);
    // Sempre 200 para a Evolution não re-tentar em loop; o erro já foi logado.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
