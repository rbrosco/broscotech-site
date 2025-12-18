'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiMonitor, FiMoon, FiSun } from 'react-icons/fi';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const isValidTheme = (value: string | null): value is Theme => value === 'light' || value === 'dark' || value === 'system';

const applyThemeToRoot = (selectedTheme: Theme) => {
  const root = document.documentElement;
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = selectedTheme === 'dark' || (selectedTheme === 'system' && systemDark);

  root.classList.remove('light', 'dark');
  root.classList.add(isDark ? 'dark' : 'light');
};

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    setMounted(true);

    const stored = localStorage.getItem(STORAGE_KEY);
    const initialTheme: Theme = isValidTheme(stored) ? stored : 'system';
    setTheme(initialTheme);
    applyThemeToRoot(initialTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    applyThemeToRoot(theme);
    localStorage.setItem(STORAGE_KEY, theme);

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeToRoot('system');
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [theme, mounted]);

  const nextThemeLabel = useMemo(() => {
    if (theme === 'light') return 'escuro';
    if (theme === 'dark') return 'sistema';
    return 'claro';
  }, [theme]);

  const iconClass = 'h-5 w-5';
  const icon = useMemo(() => {
    if (!mounted) return <FiMonitor className={iconClass} />;
    if (theme === 'light') return <FiSun className={iconClass} />;
    if (theme === 'dark') return <FiMoon className={iconClass} />;
    return <FiMonitor className={iconClass} />;
  }, [mounted, theme]);

  return (
    <button
      onClick={() =>
        setTheme((prev) => {
          if (prev === 'light') return 'dark';
          if (prev === 'dark') return 'system';
          return 'light';
        })
      }
      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
      aria-label={`Mudar tema. Atual: ${theme}. Próximo: ${nextThemeLabel}`}
      type="button"
    >
      {icon}
    </button>
  );
}