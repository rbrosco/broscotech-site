'use client'; // Necessário se estiver usando Next.js App Router e hooks como useState/useEffect

import { useState, useEffect, useCallback } from 'react';

// Defina um tipo para os temas para melhor controle
type Theme = 'light' | 'dark' | 'system';

// Ícones SVG para os temas
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12a2.25 2.25 0 00-2.25 2.25c0 1.31.946 2.447 2.25 2.447A2.25 2.25 0 0014.25 14.25 2.25 2.25 0 0012 12z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const SystemIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h4.5M21 3h-4.5M21 3l-3.75 3.75M16.5 3l3.75 3.75" />
  </svg>
);


export default function ThemeToggle() {
  // Inicializa o estado com um valor padrão consistente para SSR e primeira renderização do cliente.
  // O tema real será determinado no cliente via useEffect.
  const [theme, setTheme] = useState<Theme>('system');
  const [isClient, setIsClient] = useState(false); // Para rastrear se o componente montou no cliente

  useEffect(() => {
    setIsClient(true); // Indica que o componente montou no cliente

    // Determina o tema real uma vez no cliente
    let initialClientTheme: Theme;
    const storedTheme = localStorage.getItem('theme') as Theme | null;

    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      initialClientTheme = storedTheme;
    } else {
      // Se não houver tema no localStorage ou for inválido, o padrão é 'system'.
      // A função applyTheme cuidará da aparência com base na preferência do sistema.
      initialClientTheme = 'system';
    }
    setTheme(initialClientTheme); // Atualiza o estado, disparando uma nova renderização com o texto correto
  }, []); // Array de dependências vazio garante que rode uma vez após a montagem no cliente

  // Função para aplicar o tema ao DOM
  const applyTheme = useCallback((selectedTheme: Theme) => {
    if (typeof window === 'undefined') return; // Garante que só execute no cliente

    if (selectedTheme === 'system') {
      // Verifica a preferência do sistema e aplica
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    } else {
      // Aplica diretamente 'dark' ou remove para 'light'
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    // Este efeito aplica o tema ao DOM e atualiza o localStorage.
    // Só deve rodar no cliente após o estado do tema ter sido potencialmente atualizado.
    if (!isClient) return;

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Adiciona listener para mudanças na preferência do sistema (apenas se 'system' estiver selecionado)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') { // Re-aplica apenas se o modo 'system' estiver ativo
        applyTheme('system');
      }
    };

    if (theme === 'system') {
      mediaQuery.addEventListener('change', handleChange);
    }

    // Limpa o listener ao desmontar ou quando o tema mudar de 'system'
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, applyTheme, isClient]); // Depende de theme, applyTheme e isClient

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light'; // De 'system' volta para 'light'
    });
  };

  // Determina qual ícone mostrar com base no tema atual
  const getCurrentIcon = () => {
    if (theme === 'light') return <SunIcon />;
    if (theme === 'dark') return <MoonIcon />;
    return <SystemIcon />; // Para 'system'
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
      // O aria-label e o conteúdo de texto serão baseados no estado `theme`.
      aria-label={`Mudar tema. Atual: ${theme}. Próximo: ${theme === 'light' ? 'escuro' : theme === 'dark' ? 'sistema' : 'claro'}`}
    >
      {isClient ? getCurrentIcon() : <SystemIcon /> /* Mostra SystemIcon durante SSR/primeira renderização */}
    </button>
  );
}