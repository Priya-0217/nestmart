'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'nestmart-theme';

function readOverride(): 'light' | 'dark' | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
}

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const override = readOverride();
    const initial = override ? override === 'dark' : mql.matches;
    setIsDark(initial);
    applyTheme(initial);

    const handleSystemChange = (event: MediaQueryListEvent) => {
      if (readOverride() !== null) return;
      setIsDark(event.matches);
      applyTheme(event.matches);
    };

    mql.addEventListener('change', handleSystemChange);
    return () => mql.removeEventListener('change', handleSystemChange);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  }

  return { isDark, toggle };
}
