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
      className="fixed top-0 left-0 right-0 md:left-[var(--sidebar-width,5rem)] transition-[left] duration-300 z-30 flex items-center justify-between px-6 h-[65px] bg-white/80 dark:bg-[#0a0f1e]/85 backdrop-blur-md border-b border-slate-200 dark:border-white/10"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm pl-12 md:pl-0">
        <Link href="/" className="transition-colors text-slate-500 dark:text-white/35 hover:text-slate-900 dark:hover:text-white">
          Home
        </Link>
        <span className="text-slate-300 dark:text-white/20">/</span>
        <span className="font-semibold text-slate-900 dark:text-white">{label}</span>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
          title="Notificações"
        >
          <FiBell className="w-4 h-4" />
        </button>
        <ThemeToggle />
        <Link
          href="/perfil"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
          title="Perfil"
        >
          <FiUser className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default DashboardNav;