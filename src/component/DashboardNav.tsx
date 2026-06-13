'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBell, FiUser } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

const BREADCRUMB: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/projeto': 'Meu Projeto',
  '/dashboard/planejamento': 'Planejamento',
  '/dashboard/faturas': 'Faturas',
  '/dashboard/iaagent': 'IA Agent',
  '/dashboard/configuracoes': 'Configurações',
};

const DashboardNav: React.FC = () => {
  const pathname = usePathname();
  const label = BREADCRUMB[pathname ?? ''] ?? 'Dashboard';

  return (
    <div
      className="fixed top-0 left-0 right-0 md:left-64 z-10 flex items-center justify-between px-6 h-[65px]"
      style={{
        background: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm pl-12 md:pl-0">
        <Link href="/" className="transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Home
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
        <span className="font-semibold text-white">{label}</span>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Notificações"
        >
          <FiBell className="w-4 h-4" />
        </button>
        <ThemeToggle />
        <Link
          href="/perfil"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Perfil"
        >
          <FiUser className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default DashboardNav;