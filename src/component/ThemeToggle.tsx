'use client';

import { useEffect, useState } from 'react';
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
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let initialTheme: Theme = 'dark';
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isValidTheme(stored)) {
        initialTheme = stored;
      }
    }
    setTheme(initialTheme);
    applyThemeToRoot(initialTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeToRoot(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-full text-slate-700 dark:text-slate-300 opacity-0 pointer-events-none"
        aria-hidden="true"
        type="button"
      >
        <span className="h-5 w-5 block" />
      </button>
    );
  }

  const nextThemeLabel = theme === 'light' ? 'escuro' : 'claro';
  const iconClass = 'h-5 w-5';
  const icon = theme === 'light' ? <FiSun className={iconClass} /> : <FiMoon className={iconClass} />;

  return (
    <button
      onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
      aria-label={`Mudar tema. Atual: ${theme}. Próximo: ${nextThemeLabel}`}
      type="button"
    >
      {icon}
    </button>
  );
}