import Sidebar from '@/component/Sidebar';

/**
 * Layout compartilhado das páginas do portal do cliente (dashboard,
 * projeto, planejamento, faturas, iaagent, kanban, configurações, perfil).
 *
 * Antes, cada página renderizava <Sidebar /> por conta própria — sem um
 * layout compartilhado, o Next.js desmonta e remonta a árvore inteira a
 * cada navegação entre essas páginas, o que fazia a Sidebar "piscar"
 * (refazia a busca de sessão/usuário do zero a cada troca de página).
 *
 * Com a Sidebar aqui no layout, ela permanece montada entre navegações
 * dentro do grupo (portal) — só o conteúdo de {children} troca.
 *
 * Usa um Route Group ('(portal)') para não alterar as URLs — /dashboard,
 * /projeto etc. continuam exatamente iguais.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />
      <div className="md:pl-sidebar transition-[padding] duration-300 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
