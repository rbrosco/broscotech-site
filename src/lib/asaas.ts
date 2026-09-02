/**
 * Cliente mínimo para a API do Asaas (https://docs.asaas.com).
 *
 * Fluxo: cria (ou reaproveita) um cliente no Asaas pelo CPF/CNPJ, depois
 * cria uma cobrança vinculada a esse cliente. Usa o header `access_token`
 * (não é Authorization: Bearer — assim que o Asaas autentica).
 *
 * NÃO TESTADO contra uma conta real do Asaas (não há credenciais neste
 * ambiente) — testar no Sandbox (ASAAS_ENV=sandbox) antes de usar em
 * produção. A implementação segue a documentação oficial da API v3.
 */

function getAsaasConfig() {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) return null;

  const env = process.env.ASAAS_ENV === 'production' ? 'production' : 'sandbox';
  const baseUrl = env === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3';

  return { apiKey, baseUrl };
}

/** true quando ASAAS_API_KEY está configurado no servidor — usado para decidir entre cobrança automática e o link colado manualmente. */
export function isAsaasConfigured(): boolean {
  return getAsaasConfig() !== null;
}

async function asaasFetch(path: string, init: RequestInit) {
  const config = getAsaasConfig();
  if (!config) throw new Error('ASAAS_API_KEY não configurado no servidor.');

  const res = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'BroscoTech-EasyDev/1.0',
      access_token: config.apiKey,
      ...(init.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.errors?.[0]?.description || `Asaas retornou HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

type AsaasCustomer = { id: string };

/**
 * Busca um cliente existente pelo CPF/CNPJ (chave natural de dedupe) e
 * reaproveita; se não encontrar, cria um novo. O Asaas permite clientes
 * duplicados, então evitar isso é responsabilidade de quem integra.
 */
export async function findOrCreateAsaasCustomer(params: {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
}): Promise<AsaasCustomer> {
  const cleanDoc = params.cpfCnpj.replace(/\D/g, '');

  const search = await asaasFetch(`/customers?cpfCnpj=${encodeURIComponent(cleanDoc)}`, {
    method: 'GET',
  });
  const existing = Array.isArray(search?.data) && search.data.length > 0 ? search.data[0] : null;
  if (existing?.id) return { id: existing.id };

  const created = await asaasFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      cpfCnpj: cleanDoc,
      email: params.email || undefined,
      phone: params.phone || undefined,
    }),
  });
  return { id: created.id };
}

type AsaasPayment = { id: string; invoiceUrl: string; status: string };

/**
 * Cria uma cobrança (billingType UNDEFINED deixa o Asaas oferecer Pix,
 * boleto e cartão ao cliente, conforme o que estiver habilitado na conta).
 */
export async function createAsaasPayment(params: {
  customerId: string;
  value: number; // em reais (não centavos) — a API do Asaas espera valor decimal
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string;
}): Promise<AsaasPayment> {
  const created = await asaasFetch('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: params.customerId,
      billingType: 'UNDEFINED',
      value: params.value,
      dueDate: params.dueDate,
      description: params.description || undefined,
      externalReference: params.externalReference || undefined,
    }),
  });
  return { id: created.id, invoiceUrl: created.invoiceUrl, status: created.status };
}
