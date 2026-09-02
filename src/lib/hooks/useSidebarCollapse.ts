'use client';

import { useState, useEffect, useCallback } from 'react';

// In-memory module-level cache to preserve state across client-side page transitions
let inMemorySidebarCollapsed: boolean | null = null;
const listeners = new Set<(val: boolean) => void>();

function getStoredSidebarCollapsed(): boolean {
  if (inMemorySidebarCollapsed !== null) {
    return inMemorySidebarCollapsed;
  }
  if (typeof window !== 'undefined') {
    try {
      inMemorySidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      return inMemorySidebarCollapsed;
    } catch {
      return false;
    }
  }
  return false;
}

function setStoredSidebarCollapsed(val: boolean) {
  inMemorySidebarCollapsed = val;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('sidebarCollapsed', String(val));
      document.documentElement.style.setProperty('--sidebar-width', val ? '5rem' : '16rem');
      if (val) {
        document.documentElement.classList.add('sidebar-collapsed');
      } else {
        document.documentElement.classList.remove('sidebar-collapsed');
      }
    } catch {}
  }
  listeners.forEach((listener) => listener(val));
}

/**
 * Hook para gerenciar o estado colapsado/expandido do menu lateral (Sidebar e DevSidebar).
 *
 * Resolve o problema de "flicker" (menu estendendo e colapsando) durante a navegação entre páginas:
 * 1. Mantém o estado em memória entre transições de rota no cliente;
 * 2. Inicializa o estado de forma síncrona com o valor já armazenado;
 * 3. Notifica todos os ouvintes em tempo real se o menu for alternado;
 * 4. Sinaliza quando o componente foi montado para habilitar animações de transição
 *    apenas após a montagem inicial (evitando layout shift / animação no carregamento inicial).
 */
export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsedState] = useState<boolean>(() => getStoredSidebarCollapsed());
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    // Sincroniza com localStorage caso tenha sido alterado externamente
    const current = getStoredSidebarCollapsed();
    setIsCollapsedState(current);
    document.documentElement.style.setProperty('--sidebar-width', current ? '5rem' : '16rem');

    const handleUpdate = (val: boolean) => {
      setIsCollapsedState(val);
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    const next = !getStoredSidebarCollapsed();
    setStoredSidebarCollapsed(next);
  }, []);

  return {
    isCollapsed,
    toggleSidebar,
    isMounted,
  };
}
