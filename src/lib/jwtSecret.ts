/**
 * Retorna o segredo usado para assinar/verificar JWTs.
 *
 * Em produção, exige JWT_SECRET (ou NEXTAUTH_SECRET) configurado — nunca usa
 * um valor fixo, pois um fallback hardcoded neste repositório (que é
 * público) permitiria a qualquer pessoa forjar tokens válidos, incluindo
 * tokens com role: 'admin'.
 *
 * Em desenvolvimento, mantém um fallback fixo por conveniência, mas avisa
 * no console para não passar despercebido.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET (ou NEXTAUTH_SECRET) não está configurado. Defina essa variável de ambiente antes de rodar em produção — sem ela, não é seguro emitir ou validar tokens de autenticação.'
    );
  }

  console.warn(
    '[auth] JWT_SECRET não configurado — usando segredo fixo de desenvolvimento. Configure JWT_SECRET antes de ir para produção.'
  );
  return 'dev-only-insecure-secret-do-not-use-in-production';
}
