/**
 * Faz o parse seguro do corpo JSON de uma resposta `fetch`.
 *
 * Motivação: o padrão comum no projeto era `const data = await res.json()`
 * incondicionalmente, mesmo antes de checar `res.ok`. Isso quebra com um
 * erro genérico e confuso ("Unexpected token 'I', "Internal S"... is not
 * valid JSON") sempre que o servidor responde algo que não é JSON — por
 * exemplo, uma página de erro 500 em texto/HTML puro do Next.js, um 502/504
 * de um proxy na frente da aplicação, ou uma resposta cortada por timeout.
 *
 * Use este helper nesses pontos para sempre ter uma mensagem de erro
 * legível em vez de deixar a exceção de parse vazar para o usuário.
 *
 * Exemplo de uso (substituindo `const data = await res.json()`):
 *   const res = await fetch('/api/login', { ... });
 *   const data = await safeJson<{ message?: string }>(res);
 *   if (!res.ok) {
 *     setError(data?.message || 'Erro inesperado. Tente novamente.');
 *     return;
 *   }
 */
export async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
