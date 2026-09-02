"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type UserData = { name: string; email: string; avatar: string; role?: string };

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

/**
 * Encapsula o estado de sessão do usuário lido do localStorage,
 * extraído de Header.tsx sem alterar o comportamento original.
 *
 * O localStorage é usado apenas como cache otimista (evita "flash" de
 * deslogado enquanto a checagem de rede não responde). A fonte de
 * verdade real é sempre o back-end: toda vez que o hook monta, volta
 * a ficar visível (visibilitychange/focus) ou a cada intervalo, ele
 * revalida contra `/api/me` e corrige o estado local (inclusive
 * derrubando uma sessão que o localStorage ainda achava válida).
 */
export function useAuthSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(DEFAULT_AVATAR);
  const revalidatingRef = useRef(false);

  function readFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const loggedInStatus = localStorage.getItem('isLoggedIn');
      const storedUserData = localStorage.getItem('userData');
      if (loggedInStatus === 'true' && storedUserData) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(storedUserData));
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }

  function persistToStorage(user: UserData) {
    try {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userData', JSON.stringify(user));
    } catch {}
  }

  function clearStorage() {
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('session');
    } catch {}
  }

  // Revalida a sessão contra o back-end (fonte de verdade). Evita chamadas
  // concorrentes duplicadas (ex.: focus + visibilitychange disparando juntos).
  const revalidate = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (revalidatingRef.current) return;
    revalidatingRef.current = true;
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      if (res.ok) {
        const user = (await res.json()) as UserData;
        setIsLoggedIn(true);
        setUserData(user);
        persistToStorage(user);
      } else if (res.status === 401) {
        // Sessão inválida/expirada no servidor: derruba o estado local
        // mesmo que o localStorage ainda dissesse "logado".
        setIsLoggedIn(false);
        setUserData(null);
        clearStorage();
      }
      // Outros status (5xx, rede instável) não derrubam a sessão local —
      // evita deslogar o usuário por uma falha transitória do servidor.
    } catch {
      // Falha de rede: mantém o estado local (otimista) como está.
    } finally {
      revalidatingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Verifica o localStorage para o estado de login quando o componente monta no cliente
    readFromStorage();
    // E imediatamente confirma com o back-end (fonte de verdade real).
    void revalidate();

    // Reage a login/logout feito em outra aba/janela (evento 'storage' só
    // dispara em outras abas, não na que fez a mudança — por isso o
    // resetOnSignOut/login local ainda precisa atualizar o estado direto).
    function handleStorage(e: StorageEvent) {
      if (e.key === 'userData' || e.key === 'isLoggedIn' || e.key === null) {
        readFromStorage();
      }
    }
    // Revalida ao voltar o foco/visibilidade da aba, para detectar sessões
    // expiradas/revogadas enquanto a aba estava em background.
    function handleFocus() {
      void revalidate();
    }
    function handleVisibility() {
      if (document.visibilityState === 'visible') void revalidate();
    }
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [revalidate]);

  useEffect(() => {
    try {
      setAvatarSrc(userData?.avatar ? userData.avatar : DEFAULT_AVATAR);
    } catch {
      setAvatarSrc(DEFAULT_AVATAR);
    }
  }, [userData]);

  function resetOnSignOut() {
    setIsLoggedIn(false);
    setUserData(null);
    clearStorage();
  }

  return {
    isLoggedIn,
    userData,
    avatarSrc,
    setAvatarSrc,
    defaultAvatar: DEFAULT_AVATAR,
    resetOnSignOut,
    revalidate,
  };
}
