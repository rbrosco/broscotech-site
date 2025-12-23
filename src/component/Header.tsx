"use client";
import { useState, useEffect } from "react"; // Adicionado useEffect
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
  const [hasNewNotifications, setHasNewNotifications] = useState(true); // Estado para controlar a bolinha de notificação
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Sempre tenta sincronizar o estado de login com o backend
    const syncAuth = async () => {
      if (typeof window === "undefined") return;
      const loggedInStatus = localStorage.getItem('isLoggedIn');
      const storedUserData = localStorage.getItem('userData');
      if (loggedInStatus === 'true' && storedUserData) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(storedUserData));
        return;
      }
      // Se não houver info local, tenta buscar do backend
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          const me = await res.json();
          setIsLoggedIn(true);
          setUserData(me);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userData', JSON.stringify(me));
        } else {
          setIsLoggedIn(false);
          setUserData(null);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userData');
        }
      } catch {
        setIsLoggedIn(false);
        setUserData(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
      }
    };
    syncAuth();
  }, []);

  const defaultAvatar = '/images/Perfil_Rogger.png'; // Avatar padrão

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (hasNewNotifications) setHasNewNotifications(false); // Marcar notificações como vistas ao abrir
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setIsUserDropdownOpen(false);
    setUserData(null);
    // Limpa o localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    // Em uma aplicação real, você chamaria seu método de logout da autenticação aqui
  };

  // Definindo os links do menu — usar root-relative anchors para funcionar em outras rotas
  const navLinks = [
    { label: "Home", href: "/#Home" },
    { label: "Sobre", href: "/#Sobre" },
    { label: "Serviços", href: "/#Servicos" },  
    { label: "Depoimentos", href: "/#Depoimentos" },
    { label: "Contato", href: "/#Contato" },  
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
              width={50} // Reduzido para melhor ajuste em mobile
              height={50} // Reduzido para melhor ajuste em mobile
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
                  <span className="px-3 py-2 rounded-full hover:bg-black/5 hover:text-slate-900 transition dark:hover:bg-white/10 dark:hover:text-white">
                    {label}
                    <span
                      className="absolute left-0 bottom-0 w-full h-[1px] dark:bg-white/30 bg-black/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
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
                  className="w-8 h-8 rounded-full"
                  src={userData?.avatar && userData.avatar !== 'null' ? userData.avatar : defaultAvatar}
                  alt="user photo"
                  width={32}
                  height={32}
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
                  <li><Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white">Dashboard</Link></li>
                  <li><Link href="/perfil" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white">Perfil</Link></li>
                  <li>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white">
                      Sair
                    </button>
                  </li>
                </ul>
              </div>)}
            </div>
          ) : (
            // Login and Register Buttons (Desktop only)
            <div className="hidden lg:flex items-center space-x-3">
              <button onClick={openLoginModal} className="flex items-center px-5 py-2.5 border border-black/15 text-slate-700 font-medium rounded-full hover:bg-black/5 hover:text-slate-900 transition duration-300 ease-in-out dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white">
                Entrar
              </button>
              <Link href="/register" passHref>
                <span className="flex items-center px-5 py-2.5 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition duration-300 ease-in-out dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white">
                  Cadastre-se
                </span>
              </Link>
            </div>
          )}

          {/* Icons Group: Dark Mode Toggle, Alert, Burger Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative ml-3"> {/* ml-3 para espaço após login/user menu */}
            {/* Theme Toggle Button */}
            <ThemeToggle />

          {/* Notification Bell Icon */}
            <button
              onClick={toggleNotificationDropdown}
              className="relative p-1.5 rounded-full text-slate-700 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors duration-200 dark:text-white/80 dark:hover:bg-white/10 dark:focus:ring-white/10"
              aria-label="View notifications"
            >
              <FiBell className="h-5 w-5 sm:h-6 sm:w-6" />
              {hasNewNotifications && (
                <span className="absolute top-0.5 right-0.5 block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ring-2 ring-white dark:ring-gray-900 bg-red-500">
                  <span className="sr-only">New notifications</span>
                </span>
              )}
            </button>

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
              {/* Exemplo de item de notificação */}
              <li className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <p className="text-sm text-slate-600 dark:text-slate-300">Nova mensagem de João</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Há 5 minutos</p>
              </li>
              <li className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <p className="text-sm text-slate-600 dark:text-slate-300">Atualização do sistema agendada</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Há 2 horas</p>
              </li>
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
                  <span className="block py-2 text-slate-800 text-lg font-semibold hover:bg-black/5 rounded-xl transition dark:text-white/80 dark:hover:bg-white/10">
                    {label}
                    {/* Efeito de sublinhado similar ao desktop */}
                    <span
                      className="absolute left-1/2 bottom-0 w-1/2 h-[1px] dark:bg-white/30 bg-black/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 transform -translate-x-1/2"
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
                    className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-blue-500 dark:border-blue-400"
                    src={userData.avatar || defaultAvatar}
                    alt="user photo"
                    width={48}
                    height={48}
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
              <button onClick={openLoginModal} className="w-11/12 sm:w-3/4 flex justify-center items-center px-8 py-4 text-lg font-medium rounded-xl border border-black/15 text-slate-800 hover:bg-black/5 transition-all duration-300 transform hover:scale-[1.02] dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10">
                Entrar
              </button>
              <Link href="/register" passHref>
                <span className="w-11/12 sm:w-3/4 flex justify-center items-center px-8 py-4 text-lg font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 transform hover:scale-[1.02] dark:bg-white/90 dark:text-slate-900 dark:hover:bg-white">
                  Cadastre-se
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
    <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
};

export default Header;
