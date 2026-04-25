'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiHome, FiFolder, FiCalendar, FiFileText, FiSettings, FiCpu, FiLogOut, FiMenu, FiX, FiCode } from 'react-icons/fi';

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

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.role?.toLowerCase() === 'admin') setIsAdmin(true);
        if (parsed?.name) setUserName(parsed.name);
      }
    } catch {}
  }, []);

  const isActive = (href: string) => pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: '#0a0f1e' }}>
      {/* Logo */}
      <div className="flex flex-col items-center pt-8 pb-6 px-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" className="flex flex-col items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
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
          <span className="text-white font-extrabold tracking-[0.12em] text-sm uppercase group-hover:text-[#00d4aa] transition-colors">
            EASYDEV
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <div className="flex flex-col px-3 pt-6 gap-0.5 flex-1 overflow-y-auto">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mb-2" style={{ color: '#475569' }}>
          Área do Cliente
        </span>

        {navItems.map(({ href, label, icon: Icon }) => {
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

        {isAdmin && (
          <>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 mt-5 mb-2" style={{ color: '#475569' }}>
              Admin
            </span>
            {adminItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
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
          </>
        )}
      </div>

      {/* User info footer */}
      <div className="px-3 py-4">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg,#004aad,#00b09b)', color: '#fff' }}
          >
            {userName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName || 'Cliente'}</p>
            <p className="text-[11px]" style={{ color: '#475569' }}>{isAdmin ? 'Administrador' : 'Área do cliente'}</p>
          </div>
          <Link href="/api/logout" className="transition-colors hover:text-red-400" style={{ color: '#475569' }} title="Sair">
            <FiLogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 z-20" style={{ background: '#0a0f1e', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <SidebarContent />
      </nav>

      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 rounded-xl flex items-center justify-center transition"
        style={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-20" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileOpen(false)} />
          <nav className="md:hidden fixed top-0 left-0 bottom-0 w-64 z-30" style={{ background: '#0a0f1e', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <SidebarContent />
          </nav>
        </>
      )}
    </>
  );
};

export default Sidebar;
