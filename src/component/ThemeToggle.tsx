'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const isValidTheme = (value: string | null): value is Theme => value === 'light' || value === 'dark';

const applyThemeToRoot = (selectedTheme: Theme) => {
  const root = document.documentElement;
  const isDark = selectedTheme === 'dark';
  root.classList.remove('light', 'dark');
  root.classList.add(isDark ? 'dark' : 'light');
};

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setMounted(true);

    const stored = localStorage.getItem(STORAGE_KEY);
    const initialTheme: Theme = isValidTheme(stored) ? stored : 'light';
    setTheme(initialTheme);
    applyThemeToRoot(initialTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    applyThemeToRoot(theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Não há mais modo sistema
  }, [theme, mounted]);

  const nextThemeLabel = useMemo(() => {
    if (theme === 'light') return 'escuro';
    return 'claro';
  }, [theme]);

  const iconClass = 'h-5 w-5';
  const icon = useMemo(() => {
    if (!mounted) return <FiSun className={iconClass} />;
    if (theme === 'light') return <FiSun className={iconClass} />;
    if (theme === 'dark') return <FiMoon className={iconClass} />;
    return <FiSun className={iconClass} />;
  }, [mounted, theme]);

  return (
    <button
      onClick={() =>
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
      }
      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
      aria-label={`Mudar tema. Atual: ${theme}. Próximo: ${nextThemeLabel}`}
      type="button"
    >
      {icon}
    </button>
  );
}