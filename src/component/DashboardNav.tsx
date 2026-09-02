'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiBell, FiUser, FiLayers, FiCpu, FiFileText, FiFolder, FiCheck } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

const BREADCRUMB: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projeto': 'Meu Projeto',
  '/planejamento': 'Planejamento',
  '/faturas': 'Faturas',
  '/iaagent': 'IA Agent',
  '/perfil': 'Perfil',
  '/configuracoes': 'Configurações',
  '/dev': 'Painel Dev',
  '/dev/kanban': 'Dev • Kanban',
  '/dev/clientes': 'Dev • Clientes',
  '/dev/comunicacao': 'Dev • Comunicação',
  '/dev/faturas': 'Dev • Faturas',
  '/dev/ia-monitor': 'Dev • Monitor IA',
  '/dev/leads': 'Dev • Leads',
  '/dev/planos': 'Dev • Planos',
};

type NotificationItem = {
  id: string;
  message: string;
  projectId?: number;
  cardId?: number;
  toColumnId?: number;
  timestamp?: number;
  read?: boolean;
};

const DashboardNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const label = BREADCRUMB[pathname ?? ''] ?? (pathname?.startsWith('/dev') ? 'Área Dev' : 'Área do Cliente');

  // Título da aba reflete a página atual do portal
  useEffect(() => {
    document.title = `${label} · EasyDev CRM`;
  }, [label]);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close with Escape and return focus to the trigger button
  useEffect(() => {
    if (!isNotificationOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotificationOpen(false);
        notificationButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNotificationOpen]);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasUnread = notifications.some((n) => !n.read);

  const toggleDropdown = () => {
    setIsNotificationOpen((v) => !v);
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.read) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: n.id, updates: { read: true } }),
        });
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      } catch (e) {
        console.error(e);
      }
    }
    setIsNotificationOpen(false);
    if (n.cardId) {
      router.push(`/dashboard?card=${n.cardId}`);
    } else {
      router.push('/dashboard');
    }
  };

  function timeAgo(timestamp?: number) {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - Number(timestamp)) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  }

  return (
    <header className="fixed top-0 left-0 right-0 md:left-[var(--sidebar-width,16rem)] transition-[left] duration-300 z-30 flex items-center justify-between px-5 sm:px-8 h-[65px] bg-white/80 dark:bg-[#071324]/85 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-sm">
      {/* Breadcrumb / Section Indicator */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm pl-12 md:pl-0 font-medium">
        <Link
          href="/"
          className="font-pixel text-[10px] sm:text-xs text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent)] hover:opacity-80 transition-opacity"
        >
          EasyDev
        </Link>
        <span className="text-slate-300 dark:text-white/20">/</span>
        <span className="font-bold text-slate-800 dark:text-white">{label}</span>
      </nav>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            ref={notificationButtonRef}
            className="w-9 h-9 relative rounded-xl flex items-center justify-center transition-all text-slate-600 dark:text-white/70 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
            title="Notificações"
            aria-label={hasUnread ? 'Ver notificações (novas notificações disponíveis)' : 'Ver notificações'}
            aria-haspopup="true"
            aria-expanded={isNotificationOpen}
          >
            <FiBell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#071324] animate-pulse" />
            )}
          </button>

          {isNotificationOpen && (
            <div
              role="dialog"
              aria-label="Notificações do sistema"
              className="absolute right-0 mt-2 w-80 sm:w-88 bg-white/95 dark:bg-[#071324]/95 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl"
            >
              <div className="p-3.5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  Notificações do Sistema
                </h3>
                {hasUnread && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                    Novas
                  </span>
                )}
              </div>
              <ul className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {notifications.length === 0 ? (
                  <li className="p-6 text-xs text-center text-slate-400 dark:text-slate-500">
                    Nenhuma notificação encontrada.
                  </li>
                ) : (
                  notifications.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5 flex flex-col gap-1 ${
                        n.read ? 'opacity-60' : 'bg-cyan-500/5'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-xs text-slate-800 dark:text-slate-200 leading-relaxed ${!n.read ? 'font-semibold' : ''}`}>
                          {(() => {
                            if (typeof n.message === 'string') {
                              if (n.message.startsWith('{')) {
                                try {
                                  const parsed = JSON.parse(n.message);
                                  if (parsed.texto) return parsed.texto;
                                } catch {}
                              } else if (n.message.includes('{') && n.message.includes('}')) {
                                const jsonStartIndex = n.message.indexOf('{');
                                const prefix = n.message.substring(0, jsonStartIndex);
                                const jsonStr = n.message.substring(jsonStartIndex);
                                try {
                                  const parsed = JSON.parse(jsonStr);
                                  if (parsed.texto) return `${prefix}${parsed.texto}`;
                                } catch {}
                              }
                            }
                            return n.message;
                          })()}
                        </p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1" />}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {timeAgo(n.timestamp)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <ThemeToggle />

        <Link
          href="/perfil"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-slate-600 dark:text-white/70 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
          title="Meu Perfil"
        >
          <FiUser className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};

export default DashboardNav;