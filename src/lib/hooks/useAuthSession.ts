"use client";
import { useEffect, useState } from "react";

export type UserData = { name: string; email: string; avatar: string };

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

/**
 * Encapsula o estado de sessão do usuário lido do localStorage,
 * extraído de Header.tsx sem alterar o comportamento original.
 */
export function useAuthSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(DEFAULT_AVATAR);

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
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('session');
    } catch {}
  }

  return {
    isLoggedIn,
    userData,
    avatarSrc,
    setAvatarSrc,
    defaultAvatar: DEFAULT_AVATAR,
    resetOnSignOut,
  };
}
