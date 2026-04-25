'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FiGrid, FiLayers, FiMessageSquare, FiUsers,
  FiSettings, FiLogOut, FiMenu, FiX, FiCode,
  FiActivity,
} from 'react-icons/fi';

const devItems = [
  { href: '/dev', label: 'Visão Geral', icon: FiGrid },
  { href: '/dev/kanban', label: 'Kanban', icon: FiLayers },
  { href: '/dev/comunicacao', label: 'Comunicação', icon: FiMessageSquare },
  { href: '/dev/clientes', label: 'Clientes', icon: FiUsers },
];

const adminItems = [
  { href: '/configuracoes', label: 'Configurações', icon: FiSettings },
  { href: '/iaagent', label: 'IA Agent', icon: FiActivity },
];

const DevSidebar: React.FC = () => {
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) setUserName(parsed.name);
      }
    } catch {}
  }, []);

  const isActive = (href: string) =>
    href === '/dev' ? pathname === '/dev' : pathname.startsWith(href);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: '#080c18' }}>
      {/* Logo */}
      <div className="flex flex-col items-center pt-8 pb-6 px-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dev" className="flex flex-col items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: 'radial-gradient(circle, #00b09b, #004aad)' }} />
            <Image
              src="/images/EASYDEVLOGO.png"
              alt="EASYDEV"
              width={52}
              height={52}
              className="relative rounded-full"
              style={{ border: '2px solid rgba(0,176,155,0.4)' }}
            />
          </div>
          <div className="text-center">
            <span className="text-white font-extrabold tracking-[0.12em] text-sm uppercase group-hover:text-[#00d4aa] transition-colors">
              EASYDEV
            </span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <FiCode className="w-2.5 h-2.5" style={{ color: '#00b09b' }} />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#00b09b' }}>
                Dev Panel
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col px-3 pt-6 gap-0.5 flex-1 overflow-y-auto">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mb-2" style={{ color: '#475569' }}>
          Desenvolvimento
        </span>

        {devItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
              style={{
                background: active ? 'rgba(0,176,155,0.12)' : 'transparent',
                color: active ? '#00d4aa' : 'rgba(255,255,255,0.55)',
                borderLeft: `2px solid ${active ? '#00b09b' : 'transparent'}`,
              }}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#00b09b' }} />}
            </Link>
          );
        })}

        <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mt-5 mb-2" style={{ color: '#475569' }}>
          Sistema
        </span>
        {adminItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
              style={{
                background: active ? 'rgba(0,74,173,0.15)' : 'transparent',
                color: active ? '#60a5fa' : 'rgba(255,255,255,0.55)',
                borderLeft: `2px solid ${active ? '#004aad' : 'transparent'}`,
              }}
            >
              <Icon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
              {label}
            </Link>
          );
        })}

        {/* Switch to client view */}
        <div className="mt-4 px-3">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <FiUsers className="w-3.5 h-3.5" />
            Ver área do cliente
          </Link>
        </div>
      </div>

      {/* User footer */}
      <div className="px-3 py-4">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)' }}
          >
            {userName ? userName[0].toUpperCase() : 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName || 'Developer'}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:bg-red-500/20"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            title="Sair"
          >
            <FiLogOut className="w-3.5 h-3.5" />
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
        className="fixed top-0 left-0 h-full w-64 z-40 hidden md:block"
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
