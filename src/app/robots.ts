import type { MetadataRoute } from 'next';

const BASE_URL = 'https://easydev.com.br';

/**
 * robots.txt gerado nativamente pelo Next.js — serve em /robots.txt.
 * Bloqueia crawling das áreas logadas e de API (nada ali é conteúdo
 * público indexável); libera o restante do site institucional.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard',
        '/dashboard/',
        '/projeto',
        '/kanban',
        '/faturas',
        '/perfil',
        '/configuracoes',
        '/iaagent',
        '/planejamento',
        '/dev',
        '/dev/',
        '/login',
        '/register',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
