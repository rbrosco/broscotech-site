'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

const DASHBOARD_ROUTES = [
  '/dashboard',
  '/projeto',
  '/planejamento',
  '/faturas',
  '/iaagent',
  '/dev',
  '/configuracoes',
  '/perfil',
  '/kanban'
];

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Se a rota atual começar com alguma das rotas protegidas (do cliente/dev), não renderizamos o Footer.
  const isDashboardRoute = DASHBOARD_ROUTES.some(route => pathname?.startsWith(route));

  if (isDashboardRoute) {
    return null;
  }

  return <Footer />;
}
