'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const label = BREADCRUMB[pathname ?? ''] ?? 'Dashboard';

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar Notificações
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
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasUnread = notifications.some(n => !n.read);

  const toggleDropdown = async () => {
    const nextState = !isNotificationOpen;
    setIsNotificationOpen(nextState);
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.read) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: n.id, updates: { read: true } }),
        });
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      } catch (e) {
        console.error(e);
      }
    }

    setIsNotificationOpen(false);
    
    // Se for notificação de card, vai pro kanban do dashboard
    if (n.cardId) {
      router.push(`/dashboard?card=${n.cardId}`);
    } else {
      router.push('/dashboard/projeto');
    }
  };

  function timeAgo(timestamp?: number) {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - Number(timestamp)) / 1000);
    if (diff < 60) return 'agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} horas atrás`;
    return `${Math.floor(diff / 86400)} dias atrás`;
  }

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
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="w-9 h-9 relative rounded-xl flex items-center justify-center transition-colors text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
            title="Notificações"
          >
            <FiBell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0a0f1e]"></span>
            )}
          </button>
          
          {/* Dropdown de Notificações */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notificações</h3>
              </div>
              <ul className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="p-4 text-sm text-center text-slate-500 dark:text-slate-400">Nenhuma notificação encontrada.</li>
                ) : (
                  notifications.map(n => (
                    <li 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 border-b border-slate-50 dark:border-gray-700/50 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-gray-700 flex flex-col gap-1 ${n.read ? 'opacity-60' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm text-slate-700 dark:text-slate-200 ${!n.read ? 'font-medium' : ''}`}>
                          {(() => {
                            if (typeof n.message === 'string') {
                              if (n.message.startsWith('{')) {
                                try {
                                  const parsed = JSON.parse(n.message);
                                  if (parsed.texto) return parsed.texto;
                                } catch {}
                              } else if (n.message.includes('{') && n.message.includes('}')) {
                                // Tenta extrair o JSON se a string tiver um prefixo como 'Nova atualização no projeto: {'
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
                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1"></span>}
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(n.timestamp)}</span>
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