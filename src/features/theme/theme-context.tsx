'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'techadvisor-theme';

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
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

function persistTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private-mode storage denial must never break the header.
  }
  // Mirror into a cookie so the root layout can stamp [data-theme] into the
  // SSR HTML on the next request (no blocking script needed for first paint).
  try {
    document.cookie = `${THEME_STORAGE_KEY}=${theme}; path=/; max-age=${String(THEME_COOKIE_MAX_AGE)}; SameSite=Lax`;
  } catch {
    // Cookie denial (blocked third-party-style settings) is non-fatal: the
    // provider keeps working from localStorage for this session.
  }
}

type ThemeListener = () => void;

const themeListeners = new Set<ThemeListener>();

/**
 * Client-side ground truth, resolved once per page load from the SSR-stamped
 * attribute (cookie), else the stored choice, else OS daylight. Read at
 * module evaluation — before hydration paints anything — so it can never
 * observe a client-painted value (StrictMode-safe: no effect re-run can
 * change what was captured here).
 */
let currentTheme: Theme =
  typeof document === 'undefined'
    ? 'dark'
    : ((): Theme => {
        const stamped = document.documentElement.dataset.theme;
        if (isTheme(stamped)) return stamped;
        return readStoredTheme() ?? readPreferredTheme();
      })();

/** Hydration render always uses the lab default: exactly what the SSR HTML shows. */
function getServerSnapshot(): Theme {
  return 'dark';
}

function getClientSnapshot(): Theme {
  return currentTheme;
}

function subscribeTheme(listener: ThemeListener): () => void {
  themeListeners.add(listener);
  function onStorage(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) {
      setCurrentTheme(event.newValue);
    }
  }
  window.addEventListener('storage', onStorage);
  return () => {
    themeListeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function setCurrentTheme(next: Theme) {
  if (next === currentTheme) return;
  currentTheme = next;
  applyTheme(next);
  persistTheme(next);
  themeListeners.forEach((listener) => {
    listener();
  });
}

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * ThemeProvider: owns the runtime [data-theme] switch. Hydration renders
 * the SSR dark default; right after, the store resolves to the stamped /
 * stored / OS value via useSyncExternalStore (React's sanctioned
 * server-vs-client handoff — no mismatch possible) and a mount effect
 * paints + persists it. Changes persist to localStorage (cross-tab sync)
 * and to a cookie (SSR first paint on the next visit).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    // Paints the adopted ground (DOM writes only — no setState, so this is
    // lint-clean and can never disturb hydration).
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setCurrentTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }, []);

  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
