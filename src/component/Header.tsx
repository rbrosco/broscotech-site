"use client";
import { useState, useEffect, useMemo } from "react"; // Adicionado useEffect, useMemo
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle"; // Importar o ThemeToggle
import { FiBell } from "react-icons/fi";
import { motion } from "framer-motion";
import LoginModal from "./LoginModal";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Inicializa como não logado
  const [userData, setUserData] = useState<{ name: string; email: string; avatar: string } | null>(null); // Inicializa como null
  // Estado para controlar a bolinha de notificação — inicialmente sem notificações até receber evento do Kanban
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; cardId?: number; toColumnId?: number; toColumnTitle?: string; fromColumnTitle?: string; projectTitle?: string; timestamp?: number; read?: boolean }>>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] = useState<null | { id: string; message: string; cardId?: number; toColumnId?: number; toColumnTitle?: string; fromColumnTitle?: string; projectTitle?: string; timestamp?: number; read?: boolean }>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalLoading, setProjectModalLoading] = useState(false);
  const [projectModalData, setProjectModalData] = useState<null | { projectTitle?: string; card?: { id?: string | number; title?: string; description?: string | null } | null; fromColumn?: string; toColumn?: string }>(null);
  useEffect(() => {
    // Verifica o localStorage para o estado de login quando o componente monta no cliente
    if (typeof window !== "undefined") {
      const loggedInStatus = localStorage.getItem('isLoggedIn');
      const storedUserData = localStorage.getItem('userData');
      if (loggedInStatus === 'true' && storedUserData) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(storedUserData));
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    }
  }, []);

  // Ouvir eventos de storage para notificações do Kanban (ex.: movimento de card)
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      try {
        if (e.key === 'kanban:cardMoved') {
          const logged = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
          if (!logged) return;
          const payload = e.newValue ? JSON.parse(e.newValue) : null;
          (async () => {
            let toColTitle: string | undefined = payload?.toColumnTitle ?? undefined;
            let projectTitle: string | undefined = payload?.projectTitle ?? undefined;
            try {
              // If payload contains projectId, fetch that project's kanban to resolve titles reliably
              const q = payload?.projectId ? `?projectId=${encodeURIComponent(String(payload.projectId))}` : '';
              const resCols = await fetch(`/api/kanban${q}`, { credentials: 'include' });
              if (resCols.ok) {
                const dataCols = await resCols.json();
                const col = (dataCols?.columns || []).find((x: { id?: string | number; title?: string }) => String(x.id) === String(payload?.toColumnId));
                if (col?.title) toColTitle = col.title;
                if (!projectTitle && dataCols?.project?.title) projectTitle = dataCols.project.title;
              }
            } catch {}

            const toLabel = (() => {
              if (toColTitle) return projectTitle ? `${toColTitle} (${projectTitle})` : toColTitle;
              if (payload?.toColumnId != null) return projectTitle ? `Coluna ${payload.toColumnId} (${projectTitle})` : `Coluna ${payload.toColumnId}`;
              return '?';
            })();
            let cardTitle = payload?.cardTitle ?? undefined;
            if (!cardTitle) {
              try {
                const resAll = await fetch('/api/kanban', { credentials: 'include' });
                if (resAll.ok) {
                  const dataAll = await resAll.json();
                  for (const c of (dataAll?.columns || [])) {
                    const found = (c.cards || []).find((card: { id?: string | number; title?: string; name?: string }) => String(card.id) === String(payload?.cardId));
                    if (found) { cardTitle = (found.title ?? found.name) as string | undefined; break; }
                  }
                }
              } catch {}
            }
            const targetLabel = projectTitle ? `${projectTitle}: ${toLabel}` : toLabel;
            const msg = cardTitle
              ? `Card movido: ${cardTitle} → ${cardTitle ? targetLabel : '' }`
              : `Card #${payload?.cardId ?? '?'} movido para ${cardTitle}`;
            const notif = { id: String(payload?.timestamp ?? Date.now()) + '-' + String(payload?.cardId ?? ''), message: msg, cardId: payload?.cardId, toColumnId: payload?.toColumnId, toColumnTitle: toColTitle, projectTitle, timestamp: payload?.timestamp ?? Date.now(), read: false };
            pushNotification(notif);
            setHasNewNotifications(true);
            try {
              setIsNotificationOpen(true);
              setTimeout(() => setIsNotificationOpen(false), 6000);
            } catch {}
          })();
        }
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, []);

  // Também ouvir BroadcastChannel para sinalizar movimentos do Kanban na mesma aba
  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel('kanban');
    const handler = (ev: MessageEvent) => {
      try {
        if (ev.data && ev.data.type === 'cardMoved') {
          const logged = localStorage.getItem('isLoggedIn') === 'true';
          if (!logged) return;
          const payload = ev.data;
          (async () => {
            let toColTitle: string | undefined = payload?.toColumnTitle ?? undefined;
            let projectTitle: string | undefined = payload?.projectTitle ?? undefined;
            let cardTitle: string | undefined = payload?.cardTitle ?? undefined;
            try {
              // Prefer fetching the specific project's kanban when projectId is present
              const q = payload?.projectId ? `?projectId=${encodeURIComponent(String(payload.projectId))}` : '';
              const resCols = await fetch(`/api/kanban${q}`, { credentials: 'include' });
              if (resCols.ok) {
                const dataCols = await resCols.json();
                const col = (dataCols?.columns || []).find((x: { id?: string | number; title?: string }) => String(x.id) === String(payload?.toColumnId));
                if (col?.title) toColTitle = col.title;
                if (!projectTitle && dataCols?.project?.title) projectTitle = dataCols.project.title;
                if (!cardTitle) {
                  for (const c of (dataCols?.columns || [])) {
                    const found = (c.cards || []).find((card: { id?: string | number; title?: string; name?: string }) => String(card.id) === String(payload?.cardId));
                    if (found) { cardTitle = (found.title ?? found.name) as string | undefined; break; }
                  }
                }
              }
            } catch {}

            const toLabel = (() => {
              if (toColTitle) return projectTitle ? `${toColTitle} (${projectTitle})` : toColTitle;
              if (payload?.toColumnId != null) return projectTitle ? `Coluna ${payload.toColumnId} (${projectTitle})` : `Coluna ${payload.toColumnId}`;
              return '?';
            })();
            const targetLabel = projectTitle ? `${projectTitle}: ${toLabel}` : toLabel;
            const msg = cardTitle
              ? `Card movido: ${cardTitle} → ${targetLabel}`
              : `Card #${payload?.cardId ?? '?'} movido para ${cardTitle}`;
            const notif = { id: String(payload?.timestamp ?? Date.now()) + '-' + String(payload?.cardId ?? ''), message: msg, cardId: payload?.cardId, toColumnId: payload?.toColumnId, toColumnTitle: toColTitle, projectTitle, timestamp: payload?.timestamp ?? Date.now(), read: false };
            pushNotification(notif);
            setHasNewNotifications(true);
            try {
              setIsNotificationOpen(true);
              setTimeout(() => setIsNotificationOpen(false), 6000);
            } catch {}
          })();
        }
      } catch {
        // ignore
      }
    };
    bc.addEventListener('message', handler);
    return () => {
      bc.removeEventListener('message', handler);
      bc.close();
    };
  }, []);

  // Carregar notificações do localStorage no mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('notifications');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          void (async () => {
            const resolved = await resolveTitlesForNotifications(parsed.slice(-50));
            setNotifications(resolved);
          })();
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Carregar notificações do backend
  useEffect(() => {
    if (typeof window === 'undefined') return;
    void (async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const payload = await res.json();
        if (Array.isArray(payload?.notifications)) {
          const list = payload.notifications.slice(-50);
          const resolved = await resolveTitlesForNotifications(list);
          setNotifications(resolved);
          const anyUnread = list.some((n: { read?: boolean }) => !n.read);
          if (anyUnread && localStorage.getItem('isLoggedIn') === 'true') setHasNewNotifications(true);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const defaultAvatar = '/images/Perfil_Rogger.png'; // Avatar padrão
  const [avatarSrc, setAvatarSrc] = useState<string>(defaultAvatar);
  useEffect(() => {
    try {
      setAvatarSrc(userData?.avatar ? userData.avatar : defaultAvatar);
    } catch {
      setAvatarSrc(defaultAvatar);
    }
  }, [userData]);

  function timeAgo(timestamp?: number) {
    if (timestamp == null || Number.isNaN(Number(timestamp))) return '?';
    const diff = Math.floor((Date.now() - Number(timestamp)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  // Prepare notifications for render: dedupe by id and by (cardId,toColumnId,message) keeping latest
  const displayedNotifications = useMemo(() => {
    try {
      const out: typeof notifications = [];
      const seenIds = new Set<string>();
      const seenKeys = new Set<string>();
      const reversed = notifications.slice().reverse();
      for (const n of reversed) {
        if (!n) continue;
        if (seenIds.has(n.id)) continue;
        // Include projectId in the deduplication key to ensure per-project uniqueness
        const key = `${n.projectId ?? ''}_${n.cardId ?? ''}_${n.toColumnId ?? ''}_${String(n.message ?? '')}`;
        if (seenKeys.has(key)) continue;
        seenIds.add(n.id);
        seenKeys.add(key);
        out.push(n);
      }
      return out;
    } catch {
      return notifications.slice().reverse();
    }
  }, [notifications]);

  // Push notification sem duplicatas: verifica id, mensagem igual, ou cardId+toColumnId recente
  const pushNotification = (notif: { id: string; message: string; cardId?: number; toColumnId?: number; toColumnTitle?: string; projectTitle?: string; timestamp?: number; read?: boolean }) => {
    setNotifications((prev) => {
      try {
        // mesma id exata
        if (prev.some((n) => n.id === notif.id)) return prev;
        // mesma mensagem já existente
        if (notif.message && prev.some((n) => n.message === notif.message)) return prev;
        // mesmo card movido para mesma coluna recentemente (5s)
        if (notif.cardId != null && notif.toColumnId != null) {
          const now = Date.now();
          const ts = notif.timestamp ?? now;
          if (prev.some((n) => n.cardId === notif.cardId && n.toColumnId === notif.toColumnId && Math.abs((n.timestamp ?? now) - ts) < 5000)) return prev;
        }
      } catch {}
      const next = [...prev, notif].slice(-50);
      try { localStorage.setItem('notifications', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Resolve column/project/card titles for an array of notifications (mutates shallow copies)
  async function resolveTitlesForNotifications(list: Array<{ id: string; message: string; cardId?: number; toColumnId?: number; toColumnTitle?: string; projectTitle?: string; timestamp?: number; read?: boolean }>) {
    try {
      // Collect notifications that include projectId to fetch specific kanbans
      const byProject = new Map<string, { columns: any[]; projectTitle?: string }>();
      const projectIds = Array.from(new Set(list.map((n: any) => n.projectId).filter(Boolean)));
      // Fetch each project's kanban separately
      await Promise.all(projectIds.map(async (pid) => {
        try {
          const res = await fetch(`/api/kanban?projectId=${encodeURIComponent(String(pid))}`, { credentials: 'include' });
          if (!res.ok) return;
          const data = await res.json();
          byProject.set(String(pid), { columns: data?.columns ?? [], projectTitle: data?.project?.title });
        } catch {}
      }));
      // Also fetch a default kanban to resolve any notifications without projectId
      let defaultCols: any[] = [];
      let defaultProjectTitle: string | undefined = undefined;
      try {
        const res = await fetch('/api/kanban', { credentials: 'include' });
        if (res.ok) {
          const d = await res.json();
          defaultCols = d?.columns ?? [];
          defaultProjectTitle = d?.project?.title ?? undefined;
        }
      } catch {}

      return list.map((n: any) => {
        const copy = { ...n };
        // If no projectId, try to extract project title from message like: Card movido em "PROJECT": ...
        if (!copy.projectId && typeof copy.message === 'string') {
          try {
            const m = copy.message.match(/Card movido(?: em\s+"([^"]+)")?\s*[:|-]?\s*(.*)$/i);
            if (m && m[1]) {
              copy.projectTitle = copy.projectTitle || m[1];
            }
          } catch {}
        }
        const pid = n.projectId != null ? String(n.projectId) : null;
        const source = pid && byProject.has(pid) ? byProject.get(pid)! : { columns: defaultCols, projectTitle: defaultProjectTitle };
        const cols = source.columns || [];
        if (!copy.projectTitle && source.projectTitle) copy.projectTitle = source.projectTitle;
        if ((!copy.toColumnTitle || copy.toColumnTitle === '') && copy.toColumnId != null) {
          const t = cols.find((c: any) => String(c.id) === String(copy.toColumnId))?.title;
          copy.toColumnTitle = t ?? `Coluna ${copy.toColumnId}`;
        }
        // try resolve card title if missing
        let cardTitle: string | undefined = undefined;
        if (copy.cardId != null) {
          for (const c of cols) {
            const found = (c.cards || []).find((card: { id?: string | number; title?: string; name?: string }) => String(card.id) === String(copy.cardId));
            if (found) { cardTitle = found.title ?? found.name; break; }
          }
        }
        const toLabel = copy.toColumnTitle ? (copy.projectTitle ? `${copy.toColumnTitle} (${copy.projectTitle})` : copy.toColumnTitle) : (copy.toColumnId != null ? `Coluna ${copy.toColumnId}` : '?');
        const targetLabel = copy.projectTitle ? `${copy.projectTitle}: ${toLabel}` : toLabel;
        copy.message = cardTitle ? `Card movido: ${cardTitle} → ${targetLabel}` : `Card #${copy.cardId ?? '?'} movido para ${targetLabel}`;
        return copy;
      });
    } catch {
      return list;
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotificationDropdown = () => {
    const nextOpen = !isNotificationOpen;
    setIsNotificationOpen(nextOpen);
    if (nextOpen) {
      // marcar todas como lidas
      setNotifications((prev) => {
        const next = prev.map((n) => ({ ...n, read: true }));
        try { localStorage.setItem('notifications', JSON.stringify(next)); } catch {}
        return next;
      });
      setHasNewNotifications(false);
    }
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleSignOut = () => {
    (async () => {
      try {
        try { await fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch {}
      } finally {
        setIsLoggedIn(false);
        setIsUserDropdownOpen(false);
        setUserData(null);
        setNotifications([]);
        setHasNewNotifications(false);
        setIsNotificationOpen(false);
        // Remover chaves de sessão/credenciais locais mais comuns
        try {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userData');
          localStorage.removeItem('notifications');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('session');
        } catch {}
        try {
          await router.push('/');
          try { window.location.reload(); } catch {}
        } catch {
          try { window.location.href = '/'; } catch {}
        }
      }
    })();
  };

  // Definindo os links do menu — usar root-relative anchors para funcionar em outras rotas
  const navLinks = [
    { label: "Home", href: "/#Home" },
    { label: "Serviços", href: "/#Servicos" },
    { label: "Sobre", href: "/#Sobre" },
    { label: "Depoimentos", href: "/#Depoimentos" },
    
  ];

  return (
    <>
    <motion.header 
      className="fixed top-0 left-0 w-full z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-3 rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl shadow-sm dark:border-white/15 dark:bg-black/30">
          <div className="flex items-center justify-between px-3 sm:px-4"> {/* py-2 removido */}
        {/* Logo e Texto */}
        <div className="flex items-center space-x-2"> {/* Reduzido espaço para economizar em telas pequenas */}
          <Link href="/">
            <Image
              src="/images/EASYDEVLOGO.png"
              alt="EASYDEV Logo"
              width={80} // Reduzido para melhor ajuste em mobile
              height={80} // Reduzido para melhor ajuste em mobile
              className="cursor-pointer"
            />
          </Link>
          <Link href="/">
            <span
              className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              EASYDEV
            </span>
          </Link>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden lg:flex flex-1 justify-center space-x-4 text-slate-700 font-semibold text-base dark:text-slate-300">
          <ul className="flex space-x-4">
            {navLinks.map(({ label, href }, index) => (
              <li key={index} className="relative group">
                <Link href={href} passHref>
                  <span className="px-3 py-2 rounded-full hover:bg-white/60 hover:text-slate-900 transition dark:hover:bg-white/10 dark:hover:text-slate-900 dark:text-white">
                    {label}
                    <span
                      className="absolute left-0 bottom-0 w-full h-[1px] dark:bg-white/30 bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                    ></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right side content: Login/Register (Desktop) and Icons (All screens) */}
        <div className="flex items-center">
          {isLoggedIn ? (
            // User Avatar and Dropdown (Desktop)
            <div className="relative hidden lg:flex items-center">
              <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                id="user-menu-button"
                aria-expanded={isUserDropdownOpen}
                onClick={toggleUserDropdown}
              >
                <span className="sr-only">Open user menu</span>
                <Image
                  className="w-8 h-8 rounded-full object-cover"
                  src={avatarSrc}
                  alt="user photo"
                  width={32}
                  height={32}
                  onError={() => { try { setAvatarSrc(defaultAvatar); } catch {} }}
                />
              </button>
              {/* Dropdown menu */}
              {userData && ( <div
                className={`z-50 ${isUserDropdownOpen ? 'block' : 'hidden'} absolute top-full right-0 mt-2 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-800 dark:divide-gray-700`}
                id="user-dropdown"
                style={{ minWidth: '12rem' }} // Ajuste a largura conforme necessário
              >
                <div className="px-4 py-3">
                  <span className="block text-sm text-slate-900 dark:text-slate-100">{userData.name}</span>
                  <span className="block text-sm text-slate-500 truncate dark:text-slate-400">{userData.email}</span>
                </div>
                <ul className="py-2" aria-labelledby="user-menu-button">
                  <li><Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-900 dark:text-white">Dashboard</Link></li>
                  <li><Link href="/perfil" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-900 dark:text-white">Perfil</Link></li>
                  <li>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-900 dark:text-white">
                      Sair
                    </button>
                  </li>
                </ul>
              </div>)}
            </div>
          ) : (
            // Login and Register Buttons (Desktop only)
            <div className="hidden lg:flex items-center space-x-3">
              <button onClick={openLoginModal} className="flex items-center px-5 py-2.5 border border-black/15 text-slate-700 font-medium rounded-full hover:bg-white/60 hover:text-slate-900 transition duration-300 ease-in-out dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-slate-900 dark:text-white">
                Entrar
              </button>
              <Link href="/register" passHref>
                <span className="flex items-center px-5 py-2.5 bg-slate-900 text-slate-900 dark:text-white font-medium rounded-full hover:bg-slate-800 transition duration-300 ease-in-out dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white">
                  Cadastre-se
                </span>
              </Link>
            </div>
          )}

          {/* Icons Group: Dark Mode Toggle, Alert, Burger Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative ml-3"> {/* ml-3 para espaço após login/user menu */}
            {/* Theme Toggle Button */}
              <ThemeToggle />

            {/* Notification Bell Icon (apenas quando logado) */}
            {isLoggedIn && (
              <button
                onClick={toggleNotificationDropdown}
                className="relative p-1.5 rounded-full text-slate-700 hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors duration-200 dark:text-white/80 dark:hover:bg-white/10 dark:focus:ring-white/10"
                aria-label="View notifications"
              >
                <FiBell className="h-5 w-5 sm:h-6 sm:w-6" />
                {hasNewNotifications && (
                  <span className="absolute top-0.5 right-0.5 block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ring-2 ring-white dark:ring-gray-900 bg-red-500">
                    <span className="sr-only">New notifications</span>
                  </span>
                )}
              </button>
            )}

          {/* Notification Dropdown */}
          <div
            className={`absolute top-full right-0 mt-2 w-64 sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 transition-all duration-200 ease-out transform ${
              isNotificationOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
            }`}
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notificações</h3>
            </div>
            <ul className="max-h-64 overflow-y-auto">
                {displayedNotifications.length === 0 ? (
                  <li className="p-3 text-sm text-slate-600 dark:text-slate-300">Sem notificações</li>
                ) : (
                  displayedNotifications.map((n) => (
                    <li key={n.id} onClick={() => {
                      // Open a styled modal with project/card info instead of immediate navigation
                      setSelectedNotification(n);
                      setIsProjectModalOpen(true);
                      setIsNotificationOpen(false);
                      // marcar lida local e no backend
                      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
                      setHasNewNotifications(false);
                      try { fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id, updates: { read: true } }) }); } catch {}
                      // load project/card details asynchronously
                      (async () => {
                        setProjectModalLoading(true);
                        try {
                          const res = await fetch('/api/kanban', { credentials: 'include' });
                          if (!res.ok) throw new Error('Falha ao carregar dados do projeto');
                          const payload = await res.json();
                          const cols = payload?.columns ?? [];
                          const projectTitle = payload?.project?.title || '';
                          let foundCard: { id?: string | number; title?: string; description?: string | null } | null = null;
                          let fromColumnTitle: string | undefined = undefined;
                          let toColumnTitle: string | undefined = undefined;
                          for (const c of cols) {
                            const f = (c.cards || []).find((card: { id?: string | number }) => String(card.id) === String(n.cardId));
                            if (f) {
                              foundCard = f as { id?: string | number; title?: string; description?: string | null };
                              fromColumnTitle = c.title || (n?.fromColumnTitle ?? `toColumnTitle`);
                            }
                            if (String(c.id) === String(n.toColumnId)) toColumnTitle = c.title || (n?.toColumnTitle ?? `Coluna ${c.id}`);
                          }
                          setProjectModalData({ projectTitle, card: foundCard, fromColumn: fromColumnTitle, toColumn: toColumnTitle });
                        } catch {
                          setProjectModalData({ projectTitle: '', card: null });
                        } finally {
                          setProjectModalLoading(false);
                        }
                      })();
                    }} className={`p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer ${n.read ? 'opacity-60' : ''}`}>
                      {n.projectTitle && <p className="text-xs text-slate-500 dark:text-slate-400">{n.projectTitle}</p>}
                      <p className="text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(n.timestamp)}</p>
                    </li>
                  ))
                )}
            </ul>
          </div>

          {/* Burger Menu (Mobile only) */}
          <button
            className="lg:hidden relative w-7 h-7 z-50 text-slate-700 dark:text-slate-300" // Cor das barras do menu hambúrguer
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`block absolute left-1/2 top-1/2 w-6 h-0.5 bg-current transform -translate-x-1/2 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-2'}`}></span>
            <span className={`block absolute left-1/2 top-1/2 w-6 h-0.5 bg-current transform -translate-x-1/2 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block absolute left-1/2 top-1/2 w-6 h-0.5 bg-current transform -translate-x-1/2 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-2'}`}></span>
          </button>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden mt-2 rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-sm dark:border-white/15 dark:bg-black/30 transition-transform ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <nav>
          <ul className="flex flex-col items-center py-3 space-y-3">
            {navLinks.map(({ label, href }, index) => (
              <li key={index} className="relative group w-full text-center">
                <Link href={href} passHref>
                  <span className="block py-2 text-slate-800 text-lg font-semibold hover:bg-white/60 rounded-xl transition dark:text-white/80 dark:hover:bg-white/10">
                    {label}
                    {/* Efeito de sublinhado similar ao desktop */}
                    <span
                      className="absolute left-1/2 bottom-0 w-1/2 h-[1px] dark:bg-white/30 bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 transform -translate-x-1/2"
                    ></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Mobile Login and Register Buttons */}
        <div className="flex flex-col items-center space-y-4 py-4 border-t border-gray-200 dark:border-gray-700">
          {isLoggedIn ? (
            <>
              {userData && (
                <div className="px-4 py-2 text-center">
                  <Image
                    className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-blue-500 dark:border-blue-400 object-cover"
                    src={avatarSrc}
                    alt="user photo"
                    width={48}
                    height={48}
                    onError={() => { try { setAvatarSrc(defaultAvatar); } catch {} }}
                  />
                  <span className="block text-md font-semibold text-slate-900 dark:text-slate-100">{userData.name}</span>
                  <span className="block text-sm text-slate-500 truncate dark:text-slate-400">{userData.email}</span>
                </div>
              )}
              <Link href="/dashboard" className="w-11/12 sm:w-3/4 flex justify-center items-center px-6 py-3 text-base font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300">
                Dashboard
              </Link>
              <Link href="/perfil" className="w-11/12 sm:w-3/4 flex justify-center items-center px-6 py-3 text-base font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300">
                Perfil
              </Link>
              <button
                onClick={handleSignOut}
                className="w-11/12 sm:w-3/4 flex justify-center items-center px-6 py-3 text-base font-medium rounded-lg text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/30 transition-all duration-300" // Ajuste no hover do dark mode para Sair
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <button onClick={openLoginModal} className="w-11/12 sm:w-3/4 flex justify-center items-center px-8 py-4 text-lg font-medium rounded-xl border border-black/15 text-slate-800 hover:bg-white/60 transition-all duration-300 transform hover:scale-[1.02] dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10">
                Entrar
              </button>
              <Link href="/register" passHref>
                <span className="w-11/12 sm:w-3/4 flex justify-center items-center px-8 py-4 text-lg font-medium rounded-xl bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-800 transition-all duration-300 transform hover:scale-[1.02] dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white">
                  Cadastre-se
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />

      {/* Projeto / Card Popover (próximo ao ícone de notificações) */}
      {isProjectModalOpen && (
        <div className="fixed z-60 right-4 top-16">
          <div className="relative w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Informações do Projeto</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Detalhes relacionados à notificação selecionada.</p>
              </div>
              <button onClick={() => { setIsProjectModalOpen(false); setSelectedNotification(null); }} className="text-slate-500 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto">
              {projectModalLoading ? (
                <div className="py-6 text-center text-sm text-slate-500">Carregando...</div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-700 dark:text-slate-200"><strong>Projeto:</strong> {projectModalData?.projectTitle || '—'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200"><strong>Notificação:</strong> {selectedNotification?.message}</p>
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-slate-800 dark:text-white">Card</h4>
                    {projectModalData?.card ? (
                      <div className="mt-2 p-3 rounded-lg border border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900">
                        <p className="font-semibold text-slate-900 dark:text-white">{projectModalData.card.title}</p>
                        {projectModalData.card.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{projectModalData.card.description}</p>}
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <div>De: {projectModalData.fromColumn || '—'}</div>
                          <div>Para: {projectModalData.toColumn || '—'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Informações do card não encontradas.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 flex justify-end gap-2">
              <button onClick={() => { setIsProjectModalOpen(false); setSelectedNotification(null); }} className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-gray-700 text-sm">Fechar</button>
              <button onClick={() => {
                if (selectedNotification?.cardId) router.push(`/dashboard?card=${selectedNotification.cardId}&toColumn=${selectedNotification.toColumnId}`);
                setIsProjectModalOpen(false);
                setSelectedNotification(null);
              }} className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm">Ver no Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  };

export default Header;
