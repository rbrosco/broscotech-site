'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiChevronLeft, FiChevronRight, FiHome, FiFolder, FiCalendar, FiFileText, FiSettings, FiCpu, FiLogOut, FiMenu, FiX, FiCode } from 'react-icons/fi';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return localStorage.getItem('sidebarCollapsed') === 'true'; } catch {}
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {


        const raw = localStorage.getItem('userData');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.role?.toLowerCase() === 'admin') setIsAdmin(true);
          if (parsed?.name) setUserName(parsed.name);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '5rem' : '16rem');
  }, [isCollapsed]);

  const toggleSidebar = () => {
    const val = !isCollapsed;
    setIsCollapsed(val);
    localStorage.setItem('sidebarCollapsed', String(val));
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  const isActive = (href: string) => pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0f1e] relative">
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-[#0a0f1e] border border-slate-200 dark:border-white/10 rounded-full items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white transition-colors z-50 shadow-sm"
      >
        {isCollapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo */}
      <div className={`flex flex-col items-center pt-8 pb-6 border-b border-slate-200 dark:border-white/10 ${isCollapsed ? 'px-2' : 'px-5'}`}>
        <Link href="/dashboard" className="flex flex-col items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full blur-md opacity-40 bg-[radial-gradient(circle,#00b09b,#004aad)]" />
            <Image
              src="/images/EASYDEVLOGO.png"
              alt="EASYDEV"
              width={isCollapsed ? 36 : 48}
              height={isCollapsed ? 36 : 48}
              className="relative rounded-full border border-[#00b09b]/50 transition-all duration-300 shadow-sm"
            />
          </div>
          {!isCollapsed && (
            <span className="text-slate-900 dark:text-white font-extrabold tracking-[0.12em] text-sm uppercase group-hover:text-[#00d4aa] transition-colors">
              EASYDEV
            </span>
          )}
        </Link>
      </div>

      {/* Nav links */}
      <div className="flex flex-col pt-6 gap-1 flex-1 overflow-y-auto overflow-x-hidden">
        {isCollapsed ? (
          <div className="mx-4 mb-2 border-b border-slate-200 dark:border-white/10" />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-6 mb-2 text-slate-500 dark:text-slate-400">
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
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group border-l-2 mx-3 ${
                isCollapsed ? 'justify-center px-0' : 'px-3'
              } ${
                active 
                  ? 'bg-[#00b09b]/10 text-[#00b09b] dark:text-[#00d4aa] border-[#00b09b]' 
                  : 'border-transparent text-slate-600 dark:text-white/55 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`shrink-0 transition-transform group-hover:scale-110 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!isCollapsed && <span>{label}</span>}
              {!isCollapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00b09b]" />}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            {isCollapsed ? (
              <div className="mx-4 mt-4 mb-2 border-b border-slate-200 dark:border-white/10" />
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-6 mt-5 mb-2 text-slate-500 dark:text-slate-400">
                Admin
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
                  className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group border-l-2 mx-3 ${
                    isCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    active
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-600'
                      : 'border-transparent text-slate-600 dark:text-white/55 hover:bg-slate-50 dark:hover:bg-white/5'
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

      {/* User info footer */}
      <div className="p-4 mt-auto">
        <div className={`flex items-center rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 transition-all ${
          isCollapsed ? 'flex-col gap-3 p-3' : 'gap-3 px-3 py-3'
        }`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
            title={isCollapsed ? userName || 'Cliente' : undefined}
          >
            {userName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName || 'Cliente'}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{isAdmin ? 'Administrador' : 'Área do cliente'}</p>
            </div>
          )}
          <button onClick={handleLogout} className={`transition-colors text-slate-400 hover:text-red-500 ${isCollapsed ? '' : 'ml-auto'}`} title="Sair">
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-20 bg-white border-r border-slate-200 dark:bg-[#0a0f1e] dark:border-white/10 transition-[width] duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent />
      </nav>

      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 rounded-xl flex items-center justify-center transition bg-white border border-slate-200 text-slate-800 dark:bg-[#0a0f1e] dark:border-white/10 dark:text-white/70 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-20 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="md:hidden fixed top-0 left-0 bottom-0 w-64 z-30 bg-white border-r border-slate-200 dark:bg-[#0a0f1e] dark:border-white/10">
            <SidebarContent />
          </nav>
        </>
      )}
    </>
  );
};

export default Sidebar;
