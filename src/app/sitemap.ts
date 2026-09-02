import type { MetadataRoute } from 'next';

const BASE_URL = 'https://easydev.com.br';

/**
 * Sitemap gerado nativamente pelo Next.js (App Router) — serve em /sitemap.xml.
 * Cobre só as páginas públicas (institucionais); áreas logadas (/dashboard,
 * /projeto, /kanban, /faturas, /perfil, /dev/*) não entram por não serem
 * indexáveis (exigem login).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/depoimento', '/licenca', '/privacidade'];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.5,
  }));
}
