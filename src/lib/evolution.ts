/**
 * Cliente mínimo para a Evolution API (https://doc.evolution-api.com) —
 * usado para enviar notificações de projeto por WhatsApp e para validar
 * o payload recebido no webhook de respostas dos clientes.
 *
 * Segue o mesmo padrão de src/lib/asaas.ts: configuração 100% via env,
 * falha "suave" (loga e retorna null/false) quando não configurado, para
 * nunca quebrar o fluxo principal (criar update, criar fatura, etc.).
 *
 * Duas instâncias (uma por dev) convivem na mesma Evolution API — cada
 * projeto guarda em `assigned_dev` o nome exato da instância responsável
 * (ProjectEntity.assigned_dev). Sem isso, cai no EVOLUTION_DEFAULT_INSTANCE.
 */

function getEvolutionConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!baseUrl || !apiKey) return null;
  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

/** true quando EVOLUTION_API_URL + EVOLUTION_API_KEY estão configurados. */
export function isEvolutionConfigured(): boolean {
  return getEvolutionConfig() !== null;
}

/** Nomes de instância válidos (os 2 devs). Configurado via env, separado por vírgula. */
export function getEvolutionInstances(): string[] {
  const raw = process.env.EVOLUTION_INSTANCES || '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Instância a usar quando o projeto não tem assigned_dev definido. */
export function getDefaultEvolutionInstance(): string | null {
  return process.env.EVOLUTION_DEFAULT_INSTANCE || getEvolutionInstances()[0] || null;
}

/** Resolve qual instância Evolution atende um projeto (assigned_dev com fallback pro default). */
export function resolveInstanceForProject(assignedDev?: string | null): string | null {
  const instances = getEvolutionInstances();
  if (assignedDev && (instances.length === 0 || instances.includes(assignedDev))) {
    return assignedDev;
  }
  return getDefaultEvolutionInstance();
}

/** Normaliza telefone BR para o formato que a Evolution/WhatsApp espera: DDI+DDD+número, só dígitos. */
export function normalizePhoneForWhatsapp(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('55')) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

type SendTextResult = { ok: true; messageId?: string } | { ok: false; error: string };

/**
 * Envia uma mensagem de texto simples via Evolution API
 * (POST /message/sendText/{instance}).
 * Nunca lança — sempre retorna { ok: false, error } em caso de falha,
 * para que quem chama (ex: rota de project_updates) não precise de try/catch.
 */
export async function sendWhatsappText(params: {
  instance: string;
  phone: string;
  text: string;
}): Promise<SendTextResult> {
  const config = getEvolutionConfig();
  if (!config) return { ok: false, error: 'Evolution API não configurada (EVOLUTION_API_URL/EVOLUTION_API_KEY ausentes).' };

  const number = normalizePhoneForWhatsapp(params.phone);
  if (!number) return { ok: false, error: 'Telefone do cliente ausente ou inválido.' };

  try {
    const res = await fetch(`${config.baseUrl}/message/sendText/${encodeURIComponent(params.instance)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey,
      },
      body: JSON.stringify({
        number,
        text: params.text,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.message || data?.error || `Evolution retornou HTTP ${res.status}`;
      return { ok: false, error: Array.isArray(message) ? message.join('; ') : String(message) };
    }
    return { ok: true, messageId: data?.key?.id };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Falha de rede ao chamar a Evolution API.' };
  }
}

/**
 * Extrai { phone, text, pushName } de um payload de webhook da Evolution
 * (evento `messages.upsert`). Retorna null para eventos que não são
 * mensagens de texto recebidas de um cliente (ex: mensagens enviadas por
 * nós mesmos, status, reações, grupos).
 */
export function parseEvolutionWebhookMessage(body: any): { phone: string; text: string; pushName?: string } | null {
  const data = body?.data;
  if (!data) return null;

  // Ignora mensagens enviadas por nós (fromMe) e mensagens de grupo.
  if (data.key?.fromMe) return null;
  const remoteJid: string | undefined = data.key?.remoteJid;
  if (!remoteJid || remoteJid.endsWith('@g.us')) return null;

  const text: string | undefined =
    data.message?.conversation ||
    data.message?.extendedTextMessage?.text ||
    data.message?.imageMessage?.caption ||
    undefined;

  if (!text) return null;

  const phone = remoteJid.split('@')[0];
  return { phone, text, pushName: data.pushName };
}

// ─── Gerenciamento de instância (conectar via QR code) ────────────────────
//
// Fluxo de conexão usado pela tela Configurações > WhatsApp:
//   1. connectionState(instance) — descobre se já está 'open' (conectado).
//   2. Se não estiver conectada: ensureInstanceExists() cria a instância na
//      Evolution (idempotente — se já existir, ignora o erro de duplicidade)
//      com o webhook já configurado para /api/webhooks/evolution/{instance}.
//   3. fetchQrCode(instance) — retorna o base64 do QR para o admin escanear.
//   4. O front faz polling de connectionState() até virar 'open'.

export type EvolutionConnectionState = 'open' | 'connecting' | 'close' | 'unknown';

/** Consulta o estado atual da conexão da instância ('open' = conectada). */
export async function getConnectionState(instance: string): Promise<{ ok: true; state: EvolutionConnectionState } | { ok: false; error: string }> {
  const config = getEvolutionConfig();
  if (!config) return { ok: false, error: 'Evolution API não configurada.' };

  try {
    const res = await fetch(`${config.baseUrl}/instance/connectionState/${encodeURIComponent(instance)}`, {
      headers: { apikey: config.apiKey },
    });
    if (res.status === 404) {
      // Instância ainda não existe na Evolution.
      return { ok: true, state: 'close' };
    }
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.message || `Evolution retornou HTTP ${res.status}`;
      return { ok: false, error: Array.isArray(message) ? message.join('; ') : String(message) };
    }
    const state = (data?.instance?.state as string) || 'unknown';
    return { ok: true, state: (['open', 'connecting', 'close'].includes(state) ? state : 'unknown') as EvolutionConnectionState };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Falha de rede ao consultar status da instância.' };
  }
}

/**
 * Garante que a instância existe na Evolution (cria se necessário), já
 * apontando o webhook para nossa rota de recebimento de mensagens.
 * Idempotente: se a instância já existir, a Evolution retorna 403/409 —
 * tratamos como sucesso silencioso.
 */
async function ensureInstanceExists(instance: string, publicBaseUrl?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = getEvolutionConfig();
  if (!config) return { ok: false, error: 'Evolution API não configurada.' };

  const webhookUrl = publicBaseUrl ? `${publicBaseUrl.replace(/\/+$/, '')}/api/webhooks/evolution/${encodeURIComponent(instance)}` : undefined;

  try {
    const res = await fetch(`${config.baseUrl}/instance/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: config.apiKey },
      body: JSON.stringify({
        instanceName: instance,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        ...(webhookUrl
          ? { webhook: { enabled: true, url: webhookUrl, events: ['MESSAGES_UPSERT'] } }
          : {}),
      }),
    });

    if (res.ok || res.status === 201) return { ok: true };

    const data = await res.json().catch(() => null);
    const message = String(data?.message || data?.response?.message || '');
    // Já existe — não é erro para o nosso fluxo.
    if (res.status === 403 || res.status === 409 || /already|exist|em uso/i.test(message)) {
      return { ok: true };
    }
    return { ok: false, error: message || `Evolution retornou HTTP ${res.status} ao criar instância.` };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Falha de rede ao criar instância na Evolution.' };
  }
}

type QrCodeResult = { ok: true; base64: string | null; state: EvolutionConnectionState } | { ok: false; error: string };

/**
 * Retorna o QR code (base64, pronto para <img src="...">) para conectar a
 * instância. Cria a instância automaticamente se ela ainda não existir.
 * Se já estiver conectada ('open'), retorna base64: null e state: 'open' —
 * quem chama deve tratar isso como "já conectado, nada a escanear".
 */
export async function fetchQrCode(instance: string, publicBaseUrl?: string): Promise<QrCodeResult> {
  const config = getEvolutionConfig();
  if (!config) return { ok: false, error: 'Evolution API não configurada (EVOLUTION_API_URL/EVOLUTION_API_KEY ausentes).' };

  const stateCheck = await getConnectionState(instance);
  if (stateCheck.ok && stateCheck.state === 'open') {
    return { ok: true, base64: null, state: 'open' };
  }

  const created = await ensureInstanceExists(instance, publicBaseUrl);
  if (!created.ok) return { ok: false, error: created.error };

  try {
    const res = await fetch(`${config.baseUrl}/instance/connect/${encodeURIComponent(instance)}`, {
      headers: { apikey: config.apiKey },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.message || `Evolution retornou HTTP ${res.status}`;
      return { ok: false, error: Array.isArray(message) ? message.join('; ') : String(message) };
    }

    // Já conectada nesse meio tempo.
    if (data?.instance?.state === 'open' || data?.state === 'open') {
      return { ok: true, base64: null, state: 'open' };
    }

    const base64 = data?.base64 || data?.qrcode?.base64 || null;
    return { ok: true, base64, state: base64 ? 'connecting' : 'unknown' };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Falha de rede ao obter QR code.' };
  }
}

/** Desconecta (logout) a instância — o admin precisa escanear o QR de novo depois. */
export async function logoutInstance(instance: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = getEvolutionConfig();
  if (!config) return { ok: false, error: 'Evolution API não configurada.' };

  try {
    const res = await fetch(`${config.baseUrl}/instance/logout/${encodeURIComponent(instance)}`, {
      method: 'DELETE',
      headers: { apikey: config.apiKey },
    });
    if (!res.ok && res.status !== 404) {
      const data = await res.json().catch(() => null);
      const message = data?.message || `Evolution retornou HTTP ${res.status}`;
      return { ok: false, error: Array.isArray(message) ? message.join('; ') : String(message) };
    }
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Falha de rede ao desconectar instância.' };
  }
}
