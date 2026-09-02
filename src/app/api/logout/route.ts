import { NextResponse } from 'next/server';

/**
 * Logout "local": limpa os cookies de sessão no navegador que fez a
 * requisição. NÃO invalida o token em si — como a autenticação usa JWT
 * assinado e verificado por assinatura (ver src/middleware.ts e
 * src/lib/middlewareAuth.tsx), o token continua criptograficamente válido
 * até expirar (7 dias, definido em /api/login) mesmo depois deste logout.
 *
 * Ou seja: se o token vazou (foi copiado do cookie, de um proxy, etc.),
 * chamar /api/logout no navegador da vítima NÃO revoga esse token — ele
 * segue aceito por qualquer request que o apresente até expirar sozinho.
 * Isso é uma limitação conhecida de JWT stateless, não um bug.
 *
 * Para logout "global" de verdade (revogar o token antes da expiração)
 * seria necessário um dos dois:
 *   1. Um store de revogação (ex.: tabela/Redis com jti ou hash do token,
 *      checado em toda verificação — vira sessão "quase stateful").
 *   2. Um campo de versão de sessão no usuário (ex.: `token_version` na
 *      tabela users, incluído no payload do JWT); ao trocar de senha ou
 *      forçar logout, incrementa a versão no banco e o middleware rejeita
 *      qualquer token com versão antiga.
 * Nenhum dos dois está implementado — avaliar se vale o custo antes de
 * implementar (adiciona uma leitura no banco por request autenticada).
 */
export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logout efetuado.' });
    const isProd = process.env.NODE_ENV === 'production';
    // Clear common auth cookies
    response.cookies.set('token', '', { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 0 });
    response.cookies.set('session', '', { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 0 });
    response.cookies.set('authToken', '', { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 0 });
    return response;
  } catch (err) {
    console.error('Erro em /api/logout:', err);
    return NextResponse.json({ message: 'Erro ao efetuar logout.' }, { status: 500 });
  }
}
