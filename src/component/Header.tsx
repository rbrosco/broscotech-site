"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle"; // Importar o ThemeToggle
import { FiBell, FiX, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import LoginModal from "./LoginModal";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { useHeaderNotifications } from "@/lib/hooks/useHeaderNotifications";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const [selectedNotification, setSelectedNotification] = useState<null | { id: string; message: string; cardId?: number; toColumnId?: number; toColumnTitle?: string; fromColumnTitle?: string; projectTitle?: string; timestamp?: number; read?: boolean }>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalLoading, setProjectModalLoading] = useState(false);
  const [projectModalData, setProjectModalData] = useState<null | { projectTitle?: string; card?: { id?: string | number; title?: string; description?: string | null } | null; fromColumn?: string; toColumn?: string }>(null);

  const { isLoggedIn, userData, avatarSrc, setAvatarSrc, defaultAvatar, resetOnSignOut } = useAuthSession();
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    hasNewNotifications,
    setHasNewNotifications,
    setNotifications,
    displayedNotifications,
    toggleNotificationDropdown,
    timeAgo,
    clearForSignOut,
  } = useHeaderNotifications();

  // Refs for click-outside detection
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Close user dropdown if clicking outside
      if (isUserDropdownOpen && userDropdownRef.current && userMenuButtonRef.current) {
        if (!userDropdownRef.current.contains(target) && !userMenuButtonRef.current.contains(target)) {
          setIsUserDropdownOpen(false);
        }
      }

      // Close notification dropdown if clicking outside
      if (isNotificationOpen && notificationDropdownRef.current && notificationButtonRef.current) {
        if (!notificationDropdownRef.current.contains(target) && !notificationButtonRef.current.contains(target)) {
          setIsNotificationOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen, isNotificationOpen]);

  // Fecha dropdowns/menu mobile com a tecla Escape e devolve o foco ao gatilho
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (isUserDropdownOpen) {
        setIsUserDropdownOpen(false);
        userMenuButtonRef.current?.focus();
      }
      if (isNotificationOpen) {
        setIsNotificationOpen(false);
        notificationButtonRef.current?.focus();
      }
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isUserDropdownOpen, isNotificationOpen, isMobileMenuOpen, setIsNotificationOpen]);

  // Fecha o popover de projeto/card com Escape
  useEffect(() => {
    if (!isProjectModalOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProjectModalOpen(false);
        setSelectedNotification(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isProjectModalOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
        resetOnSignOut();
        setIsUserDropdownOpen(false);
        clearForSignOut();
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
    { label: "Planos", href: "/#Planos" },
    { label: "Portfólio", href: "/#Portfolio" },
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
        <div className="mt-3 rounded-2xl border border-black/8 bg-white/80 backdrop-blur-xl shadow-sm dark:border-white/10 dark:bg-white/8">
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
          <Link href="/" className="flex items-center gap-1.5 group">
            <span
              className="font-pixel text-[11px] sm:text-sm md:text-base lg:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent)] hover:opacity-90 transition-all inline-block drop-shadow-sm"
            >
              EasyDev
            </span>
            <span
              className="font-pixel text-[9px] sm:text-[11px] md:text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/30 tracking-widest uppercase shadow-[0_0_8px_rgba(6,182,212,0.25)] group-hover:scale-105 transition-transform"
            >
              CRM
            </span>
          </Link>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden lg:flex flex-1 justify-center space-x-1 text-slate-700 font-medium text-sm dark:text-slate-300">
          <ul className="flex space-x-1">
            {navLinks.map(({ label, href }, index) => (
              <li key={index} className="relative group">
                <Link href={href} passHref>
                  <span className="px-4 py-2 rounded-full hover:bg-black/5 text-slate-700 hover:text-slate-900 transition dark:hover:bg-white/8 dark:text-white/80 dark:hover:text-white">
                    {label}
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
                ref={userMenuButtonRef}
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
                ref={userDropdownRef}
                role="menu"
                aria-label="Menu do usuário"
                aria-hidden={!isUserDropdownOpen}
                className={`z-50 ${isUserDropdownOpen ? 'block' : 'hidden'} absolute top-full right-0 mt-2 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-800 dark:divide-gray-700`}
                id="user-dropdown"
                style={{ minWidth: '12rem' }} // Ajuste a largura conforme necessário
              >
                <div className="px-4 py-3">
                  <span className="block text-sm text-slate-900 dark:text-slate-100">{userData.name}</span>
                  <span className="block text-sm text-slate-500 truncate dark:text-slate-400">{userData.email}</span>
                </div>
                <ul className="py-2" aria-labelledby="user-menu-button">
                  <li role="none"><Link href="/dashboard" role="menuitem" tabIndex={isUserDropdownOpen ? 0 : -1} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">Dashboard</Link></li>
                  <li role="none"><Link href="/perfil" role="menuitem" tabIndex={isUserDropdownOpen ? 0 : -1} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">Perfil</Link></li>
                  <li role="none">
                    <button
                      onClick={handleSignOut}
                      role="menuitem"
                      tabIndex={isUserDropdownOpen ? 0 : -1}
                      aria-label="Sair da conta"
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-900 dark:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                      Sair
                    </button>
                  </li>
                </ul>
              </div>)}
            </div>
          ) : (
            // Login and Register Buttons (Desktop only)
            <div className="hidden lg:flex items-center space-x-3">
              <button onClick={openLoginModal} className="flex items-center px-4 py-2 border border-black/10 text-slate-700 font-medium text-sm rounded-full hover:bg-black/5 hover:text-slate-900 transition duration-200 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/8 dark:hover:text-white">
                Entrar
              </button>
              <Link href="/register" passHref>
                <span className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition duration-200 dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white">
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
                ref={notificationButtonRef}
                onClick={toggleNotificationDropdown}
                className="relative p-1.5 rounded-full text-slate-700 hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-colors duration-200 dark:text-white/80 dark:hover:bg-white/10"
                aria-label="Ver notificações"
              >
                <FiBell className="h-5 w-5 sm:h-6 sm:w-6" />
                {hasNewNotifications && (
                  <span className="absolute top-0.5 right-0.5 block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ring-2 ring-white dark:ring-gray-900 bg-red-500">
                    <span className="sr-only">Novas notificações</span>
                  </span>
                )}
              </button>
            )}

          {/* Notification Dropdown */}
          <div
            ref={notificationDropdownRef}
            role="dialog"
            aria-label="Notificações"
            aria-hidden={!isNotificationOpen}
            className={`absolute top-full right-0 mt-3 w-72 sm:w-96 rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#071324]/95 shadow-2xl backdrop-blur-2xl z-20 overflow-hidden transition-all duration-200 ease-out transform origin-top-right ${
              isNotificationOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
            }`}
          >
            {/* glow decorativo, mesmo padrão do resto do site */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--color-accent-dim)] blur-[60px] -z-10" />

            <div className="px-4 py-3.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-[var(--color-accent-dim)] to-transparent">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
                >
                  <FiBell className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  Notificações
                </h3>
              </div>
              {hasNewNotifications && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent)]/25">
                  Novas
                </span>
              )}
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
                {displayedNotifications.length === 0 ? (
                  <li className="p-6 text-center">
                    <div className="w-10 h-10 mx-auto rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-400 mb-2">
                      <FiBell className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Nenhuma notificação por aqui.</p>
                  </li>
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
                    }} className={`px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5 flex flex-col gap-1 ${n.read ? 'opacity-60' : 'bg-[var(--color-accent-dim)]/40'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {n.projectTitle && <p className="text-[11px] font-semibold text-[var(--color-accent)] mb-0.5 truncate">{n.projectTitle}</p>}
                          <p className={`text-xs leading-relaxed text-slate-700 dark:text-slate-200 ${!n.read ? 'font-semibold' : ''}`}>
                            {(() => {
                              if (typeof n.message === 'string' && n.message.startsWith('{')) {
                                try {
                                  const parsed = JSON.parse(n.message);
                                  if (parsed.texto) return parsed.texto;
                                } catch {}
                              }
                              return n.message;
                            })()}
                          </p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0 mt-1" />}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{timeAgo(n.timestamp)}</p>
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
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-popover-title"
            className="relative w-80 sm:w-96 rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#071324]/95 shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--color-accent-dim)] blur-[60px] -z-10" />

            <div className="px-4 py-3.5 border-b border-black/5 dark:border-white/10 flex items-start justify-between bg-gradient-to-r from-[var(--color-accent-dim)] to-transparent">
              <div>
                <h3 id="project-popover-title" className="text-sm font-bold text-slate-900 dark:text-white">Informações do Projeto</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Detalhes relacionados à notificação selecionada.</p>
              </div>
              <button
                onClick={() => { setIsProjectModalOpen(false); setSelectedNotification(null); }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                aria-label="Fechar"
              >
                <FiX className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto">
              {projectModalLoading ? (
                <div className="py-8 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
                  <span className="text-xs text-slate-400">Carregando...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] mb-1">Projeto</p>
                    <p className="text-sm text-slate-800 dark:text-white font-semibold">{projectModalData?.projectTitle || '—'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] mb-1">Notificação</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{selectedNotification?.message}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Card</h4>
                    {projectModalData?.card ? (
                      <div className="p-3.5 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-dim)]/40">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{projectModalData.card.title}</p>
                        {projectModalData.card.description && <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{projectModalData.card.description}</p>}
                        <div className="mt-2.5 pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-medium">{projectModalData.fromColumn || '—'}</span>
                          <FiArrowRight className="w-3 h-3 text-[var(--color-accent)]" />
                          <span className="font-semibold text-[var(--color-accent)]">{projectModalData.toColumn || '—'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 dark:text-slate-500 italic">Informações do card não encontradas.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-3.5 border-t border-black/5 dark:border-white/10 flex justify-end gap-2.5 bg-slate-50/70 dark:bg-white/[0.02]">
              <button
                onClick={() => { setIsProjectModalOpen(false); setSelectedNotification(null); }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  if (selectedNotification?.cardId) router.push(`/dashboard?card=${selectedNotification.cardId}&toColumn=${selectedNotification.toColumnId}`);
                  setIsProjectModalOpen(false);
                  setSelectedNotification(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg, #004aad, #00b09b)' }}
              >
                Ver no Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  };

export default Header;
