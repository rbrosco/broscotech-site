'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FiChevronLeft, FiChevronRight, FiGrid, FiLayers, FiMessageSquare, FiUsers,
  FiSettings, FiLogOut, FiMenu, FiX, FiCode, FiActivity, FiFileText, FiCpu
} from 'react-icons/fi';

const devItems = [
  { href: '/dev', label: 'Visão Geral', icon: FiGrid },
  { href: '/dev/kanban', label: 'Kanban', icon: FiLayers },
  { href: '/dev/comunicacao', label: 'Comunicação', icon: FiMessageSquare },
  { href: '/dev/clientes', label: 'Clientes', icon: FiUsers },
  { href: '/dev/faturas', label: 'Faturas', icon: FiFileText },
  { href: '/dev/ia-monitor', label: 'Monitor IA', icon: FiCpu },
];

const adminItems = [
  { href: '/configuracoes', label: 'Configurações', icon: FiSettings },
  { href: '/iaagent', label: 'IA Agent', icon: FiActivity },
];

const DevSidebar: React.FC = () => {
  const pathname = usePathname();
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

  const isActive = (href: string) =>
    href === '/dev' ? pathname === '/dev' : pathname.startsWith(href);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0f1e] relative" >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute -right-3 top-10 w-6 h-6 rounded-full items-center justify-center transition-colors z-50 shadow-sm"
        style={{ background: '#0d1224', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
      >
        {isCollapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo */}
      <div className={`flex flex-col items-center pt-8 pb-6 border-b border-slate-200 dark:border-white/10 ${isCollapsed ? 'px-2' : 'px-5'}`}>
        <Link href="/dev" className="flex flex-col items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full blur-md opacity-40" style={{ background: 'radial-gradient(circle, #00b09b, #004aad)' }} />
            <Image
              src="/images/EASYDEVLOGO.png"
              alt="EASYDEV"
              width={isCollapsed ? 36 : 48}
              height={isCollapsed ? 36 : 48}
              className="relative rounded-full border border-[#00b09b]/50 transition-all duration-300 shadow-sm"
            />
          </div>
          {!isCollapsed && (
            <div className="text-center">
              <span className="text-slate-900 dark:text-white font-extrabold tracking-[0.12em] text-sm uppercase group-hover:text-[#00d4aa] transition-colors">
                EASYDEV
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <FiCode className="w-2.5 h-2.5" style={{ color: '#00b09b' }} />
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#00b09b' }}>
                  Dev Panel
                </span>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col pt-6 gap-1 flex-1 overflow-y-auto overflow-x-hidden">
        {isCollapsed ? (
          <div className="mx-4 mb-2 border-b border-slate-200 dark:border-white/10" />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-6 mb-2 text-slate-500">
            Desenvolvimento
          </span>
        )}

        {devItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group mx-3 border-l-2 ${
                isCollapsed ? 'px-0 justify-center' : 'px-3'
              } ${active ? "bg-[#00b09b]/10 text-[#00b09b] dark:text-[#00d4aa] border-[#00b09b]" : "border-transparent text-slate-600 dark:text-white/55 hover:bg-slate-50 dark:hover:bg-white/5"}`}
              
            >
              <Icon className={`shrink-0 transition-transform group-hover:scale-110 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!isCollapsed && <span>{label}</span>}
              {!isCollapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#00b09b' }} />}
            </Link>
          );
        })}

        {isCollapsed ? (
          <div className="mx-4 mt-4 mb-2 border-b border-slate-200 dark:border-white/10" />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-6 mt-5 mb-2 text-slate-500">
            Sistema
          </span>
        )}
        
        {adminItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group mx-3 border-l-2 ${
                isCollapsed ? 'px-0 justify-center' : 'px-3'
              } ${active ? "bg-[#00b09b]/10 text-[#00b09b] dark:text-[#00d4aa] border-[#00b09b]" : "border-transparent text-slate-600 dark:text-white/55 hover:bg-slate-50 dark:hover:bg-white/5"}`}
              
            >
              <Icon className={`shrink-0 transition-transform group-hover:scale-110 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!isCollapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {/* Switch to client view */}
        <div className={`mt-4 ${isCollapsed ? 'mx-3' : 'px-3'}`}>
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            title={isCollapsed ? 'Ver área do cliente' : undefined}
            className={`flex items-center gap-2 py-2 rounded-xl text-xs font-semibold transition border ${
              isCollapsed ? 'justify-center px-0' : 'px-3'
            } bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-white/5 dark:text-white/40 dark:border-white/10 dark:hover:bg-white/10`}
          >
            <FiUsers className={isCollapsed ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
            {!isCollapsed && "Ver área do cliente"}
          </Link>
        </div>
      </div>

      {/* User footer */}
      <div className="p-4 mt-auto">
        <div
          className={`flex items-center rounded-xl transition-all border ${
            isCollapsed ? 'flex-col gap-3 p-3' : 'gap-3 px-3 py-3'
          } bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10`}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
            title={isCollapsed ? userName || 'Developer' : undefined}
          >
            {userName ? userName[0].toUpperCase() : 'D'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userName || 'Developer'}</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition hover:bg-red-500/20 ${
              isCollapsed ? '' : 'ml-auto'
            }`}
            style={{ color: 'rgba(255,255,255,0.3)' }}
            title="Sair"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center md:hidden"
        style={{ background: 'rgba(0,176,155,0.15)', color: '#00b09b', border: '1px solid rgba(0,176,155,0.2)' }}
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
      </button>

      {/* Desktop */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 hidden md:block transition-[width] duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-64 z-50 md:hidden">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default DevSidebar;
