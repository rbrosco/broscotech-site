/**
 * Rate limiting simples em memória, por processo.
 *
 * Não usa Redis/infra externa de propósito: o app roda como processo único
 * (ver AGENTS.md / notas do projeto — `npm run start` manual, sem cluster).
 * Isso significa duas limitações conhecidas, aceitas por ora:
 *   1. O contador zera se o processo reiniciar (deploy, crash, etc.).
 *   2. Só protege essa instância — se um dia o app rodar em múltiplos
 *      processos/instâncias atrás de um load balancer, cada uma terá seu
 *      próprio contador e o limite efetivo vira (limite × nº de instâncias).
 * Se isso virar um problema real, trocar por um store compartilhado
 * (Redis/Upstash) mantendo a mesma assinatura de `consume()`.
 */

type Bucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, Bucket>();

// Evita crescimento ilimitado do Map: varre e descarta buckets expirados
// periodicamente, disparado de forma preguiçosa a cada N chamadas.
let callsSinceSweep = 0;
function sweepExpired(now: number, windowMs: number) {
  callsSinceSweep += 1;
  if (callsSinceSweep < 200) return;
  callsSinceSweep = 0;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > windowMs) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Tentativas restantes na janela atual (0 se bloqueado). */
  remaining: number;
  /** Segundos até a janela atual resetar. */
  retryAfterSeconds: number;
};

/**
 * Consome uma tentativa da chave informada usando janela fixa deslizante.
 * `limit` tentativas permitidas a cada `windowMs` milissegundos.
 */
export function consumeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now, windowMs);

  const existing = buckets.get(key);
  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

/** Extrai o IP do cliente a partir dos headers padrão de proxy reverso. */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
