'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'techadvisor-theme';

function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

function readInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const current = document.documentElement.dataset.theme;
    if (isTheme(current)) return current;
  }
  return readStoredTheme() ?? readPreferredTheme();
}

function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

function readPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  } catch {
    // Media query unavailable (older browsers, some test envs): stay on the lab default.
  }
  return 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider: owns the runtime [data-theme] switch. The inline script in
 * the root layout already painted the right ground; this provider hydrates
 * from that same value (stored choice wins, OS daylight is the fallback),
 * persists changes, and stays in sync across tabs.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Hydrates from the ground the inline layout script already painted
  // (stored choice wins, OS daylight is the fallback) — no effect needed.
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Private-mode storage denial must never break the header.
    }
  }, [theme]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) {
        setThemeState(event.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
