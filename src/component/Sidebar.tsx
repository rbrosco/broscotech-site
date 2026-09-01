'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '../lib/hooks/useAuthSession';
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiFolder,
  FiCalendar,
  FiFileText,
  FiSettings,
  FiCpu,
  FiLogOut,
  FiMenu,
  FiX,
  FiCode,
} from 'react-icons/fi';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/projeto', label: 'Meu Projeto', icon: FiFolder },
  { href: '/planejamento', label: 'Planejamento', icon: FiCalendar },
  { href: '/faturas', label: 'Faturas', icon: FiFileText },
  { href: '/iaagent', label: 'IA Agent', icon: FiCpu },
];

const adminItems = [
  { href: '/dev', label: 'Painel Dev', icon: FiCode },
  { href: '/configuracoes', label: 'Configurações', icon: FiSettings },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { userData, resetOnSignOut } = useAuthSession();
  const isAdmin = userData?.role?.toLowerCase() === 'admin';
  const userName = userData?.name ?? '';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('sidebarCollapsed') === 'true') {
        setIsCollapsed(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '5rem' : '16rem');
  }, [isCollapsed]);

  // Fecha o drawer mobile com Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const toggleSidebar = () => {
    const val = !isCollapsed;
    setIsCollapsed(val);
    localStorage.setItem('sidebarCollapsed', String(val));
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    resetOnSignOut();
    window.location.href = '/login';
  };

  const isActive = (href: string) => pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#071324] relative">
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        aria-expanded={!isCollapsed}
        className="hidden md:flex absolute -right-3 top-9 w-6 h-6 bg-white dark:bg-[#071324] border border-slate-200 dark:border-white/10 rounded-full items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white transition-colors z-50 shadow-sm"
      >
        {isCollapsed ? <FiChevronRight className="w-3.5 h-3.5" aria-hidden="true" /> : <FiChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />}
      </button>

      {/* Brand Header */}
      <div className={`flex flex-col items-center pt-7 pb-5 border-b border-slate-200 dark:border-white/10 ${isCollapsed ? 'px-2' : 'px-5'}`}>
        <Link href="/dashboard" className="flex flex-col items-center gap-2 group" onClick={() => setMobileOpen(false)}>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full blur-md opacity-50 bg-[radial-gradient(circle,#00b09b,#004aad)] group-hover:opacity-75 transition-opacity" />
            <Image
              src="/images/EASYDEVLOGO.png"
              alt="EasyDev CRM"
              width={isCollapsed ? 36 : 46}
              height={isCollapsed ? 36 : 46}
              className="relative rounded-full border border-[#00b09b]/50 shadow-md transition-transform group-hover:scale-105"
            />
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="font-pixel text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-cyan-400 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-300">
                EasyDev
              </span>
              <span className="font-pixel text-[9px] px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 uppercase">
                CRM
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex flex-col pt-5 gap-1 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {isCollapsed ? (
          <div className="mx-4 mb-2 border-b border-slate-200 dark:border-white/10" />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest px-6 mb-2 text-slate-400 dark:text-slate-500">
            Área do Cliente
          </span>
        )}

        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 group mx-3 border-l-2 ${
                isCollapsed ? 'justify-center px-0' : 'px-3.5'
              } ${
                active
                  ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)] font-bold shadow-sm'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`shrink-0 transition-transform group-hover:scale-110 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!isCollapsed && <span>{label}</span>}
              {!isCollapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            {isCollapsed ? (
              <div className="mx-4 mt-4 mb-2 border-b border-slate-200 dark:border-white/10" />
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest px-6 mt-5 mb-2 text-slate-400 dark:text-slate-500">
                Engenharia & Admin
              </span>
            )}
            {adminItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={isCollapsed ? label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 group mx-3 border-l-2 ${
                    isCollapsed ? 'justify-center px-0' : 'px-3.5'
                  } ${
                    active
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-600 font-bold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`shrink-0 transition-transform group-hover:scale-110 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  {!isCollapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* User Info Footer */}
      <div className="p-3.5 mt-auto border-t border-slate-200 dark:border-white/10">
        <div
          className={`flex items-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all ${
            isCollapsed ? 'flex-col gap-2 p-2' : 'gap-2.5 px-3 py-2.5'
          }`}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
            title={isCollapsed ? userName || 'Cliente' : undefined}
          >
            {userName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userName || 'Cliente'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{isAdmin ? 'Administrador' : 'Portal do Cliente'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            aria-label="Sair da conta"
            className={`p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ${
              isCollapsed ? '' : 'ml-auto'
            }`}
            title="Sair"
          >
            <FiLogOut className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-20 bg-white border-r border-slate-200 dark:bg-[#071324] dark:border-white/10 transition-[width] duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </nav>

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-3.5 left-3.5 z-40 w-10 h-10 rounded-xl flex items-center justify-center transition bg-white/90 dark:bg-[#071324]/90 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white shadow-lg backdrop-blur-md"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <FiX className="w-5 h-5" aria-hidden="true" /> : <FiMenu className="w-5 h-5" aria-hidden="true" />}
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <nav
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="md:hidden fixed top-0 left-0 bottom-0 w-64 z-50 bg-white border-r border-slate-200 dark:bg-[#071324] dark:border-white/10 shadow-2xl"
          >
            <SidebarContent />
          </nav>
        </>
      )}
    </>
  );
};

export default Sidebar;
