'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { clearAdvisorChatState } from '@/lib/api/advisor';
import type { AuthUser } from '@/lib/api/auth';
import type { LoginFormValues, RegisterFormValues } from './schemas';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export interface SessionContextValue {
  status: SessionStatus;
  user: AuthUser | null;
  login: (values: LoginFormValues) => Promise<{ ok: true } | { ok: false; message: string }>;
  register: (values: RegisterFormValues) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionResponse {
  authenticated: boolean;
  user: AuthUser | null;
}

async function readSession(): Promise<SessionResponse> {
  const res = await fetch('/api/auth/session', { credentials: 'same-origin' });
  if (!res.ok) {
    return { authenticated: false, user: null };
  }
  return (await res.json()) as SessionResponse;
}

function errorMessage(status: number, body: unknown): string {
  if (body !== null && typeof body === 'object') {
    const message = (body as Record<string, unknown>)['message'];
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return `Request failed with status ${String(status)}`;
}

/**
 * Client session provider. Tokens live in httpOnly cookies (set by the BFF),
 * so this context only ever sees `{ authenticated, user }`. After login or
 * registration it merges the guest cart into the user cart server-side.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  // Last known authenticated id. A ref (not state) because `login`/`register`
  // close over `refresh` and must see the id that was current when they run.
  const userIdRef = useRef<string | null>(null);

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const session = await readSession();
      const next = session.authenticated ? session.user : null;
      if (userIdRef.current !== null && next !== null && userIdRef.current !== next.id) {
        // Account switch without a logout in between (e.g. expired session +
        // login as someone else): drop the previous account's advisor chat so
        // its conversation is never shown to the new account.
        clearAdvisorChatState();
      }
      userIdRef.current = next?.id ?? null;
      setUser(next);
      setStatus(next ? 'authenticated' : 'anonymous');
      return next;
    } catch {
      userIdRef.current = null;
      setUser(null);
      setStatus('anonymous');
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    readSession()
      .then((session) => {
        if (cancelled) return;
        const next = session.authenticated ? session.user : null;
        userIdRef.current = next?.id ?? null;
        setUser(next);
        setStatus(next ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (!cancelled) {
          userIdRef.current = null;
          setUser(null);
          setStatus('anonymous');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mergeGuestCart = useCallback(async () => {
    try {
      await fetch('/api/cart/merge', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // Merge is best-effort: the user cart still works without it.
    }
  }, []);

  const login = useCallback(
    async (values: LoginFormValues) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        return {
          ok: false as const,
          message: errorMessage(res.status, await res.json().catch(() => null)),
        };
      }
      await mergeGuestCart();
      await refresh();
      return { ok: true as const };
    },
    [mergeGuestCart, refresh],
  );

  const register = useCallback(
    async (values: RegisterFormValues) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: values.email, password: values.password, name: values.name }),
      });
      if (!res.ok) {
        return {
          ok: false as const,
          message: errorMessage(res.status, await res.json().catch(() => null)),
        };
      }
      await mergeGuestCart();
      await refresh();
      return { ok: true as const };
    },
    [mergeGuestCart, refresh],
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      // Drop the advisor chat (localStorage + mounted bubbles) so the next
      // account (or a guest) never sees the previous user's conversation.
      clearAdvisorChatState();
      userIdRef.current = null;
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ status, user, login, register, logout, refresh }),
    [status, user, login, register, logout, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
