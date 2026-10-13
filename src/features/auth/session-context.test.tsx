import { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '@/lib/api/auth';
import { chatSessionHistoryStorageKey, chatSessionStorageKey } from '@/lib/api/advisor';
import { SessionProvider, useSession, type SessionContextValue } from './session-context';

const userA = { id: 'user-a', email: 'a@example.com', role: 'CUSTOMER' } as AuthUser;
const userB = { id: 'user-b', email: 'b@example.com', role: 'CUSTOMER' } as AuthUser;

let currentSession: { authenticated: boolean; user: AuthUser | null };
let loginAs: AuthUser | null;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function stubFetch(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      if (url === '/api/auth/session') return Promise.resolve(jsonResponse(200, currentSession));
      if (url === '/api/auth/login' && method === 'POST') {
        if (loginAs) currentSession = { authenticated: true, user: loginAs };
        return Promise.resolve(jsonResponse(200, {}));
      }
      if (url === '/api/auth/register' && method === 'POST') {
        if (loginAs) currentSession = { authenticated: true, user: loginAs };
        return Promise.resolve(jsonResponse(200, {}));
      }
      if (url === '/api/cart/merge') return Promise.resolve(jsonResponse(200, {}));
      return Promise.resolve(jsonResponse(404, {}));
    }),
  );
}

let captured: SessionContextValue | null = null;

function Probe() {
  const context = useSession();
  useEffect(() => {
    captured = context;
  }, [context]);
  return <span>probe</span>;
}

function seedAdvisorState(): void {
  window.localStorage.setItem(chatSessionStorageKey('es'), 's-old');
  window.localStorage.setItem(
    chatSessionHistoryStorageKey('es'),
    JSON.stringify([{ id: 's-old', preview: 'Old chat' }]),
  );
}

function advisorStatePresent(): boolean {
  return (
    window.localStorage.getItem(chatSessionStorageKey('es')) !== null ||
    window.localStorage.getItem(chatSessionHistoryStorageKey('es')) !== null
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
  captured = null;
  loginAs = null;
  currentSession = { authenticated: false, user: null };
});

describe('SessionProvider advisor cleanup', () => {
  it('clears the advisor chat when logging in as a different account', async () => {
    currentSession = { authenticated: true, user: userA };
    loginAs = userB;
    stubFetch();
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await screen.findByText('probe');
    await waitFor(() => {
      expect(captured?.status).toBe('authenticated');
    });

    seedAdvisorState();
    expect(advisorStatePresent()).toBe(true);

    let result: unknown = null;
    await act(async () => {
      result = await captured?.login({ email: 'b@example.com', password: 'x' });
    });
    expect(result).toEqual({ ok: true });
    expect(captured?.user?.id).toBe('user-b');
    expect(advisorStatePresent()).toBe(false);
  });

  it('keeps the advisor chat when a guest logs in (continuity)', async () => {
    currentSession = { authenticated: false, user: null };
    loginAs = userA;
    stubFetch();
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await screen.findByText('probe');
    await waitFor(() => {
      expect(captured?.status).toBe('anonymous');
    });

    seedAdvisorState();

    await act(async () => {
      await captured?.login({ email: 'a@example.com', password: 'x' });
    });
    expect(captured?.user?.id).toBe('user-a');
    expect(advisorStatePresent()).toBe(true);
  });

  it('clears the advisor chat on logout', async () => {
    currentSession = { authenticated: true, user: userA };
    stubFetch();
    // Logout posts to the BFF; keep the stubbed session so only the
    // client-side cleanup is under test.
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await screen.findByText('probe');
    await waitFor(() => {
      expect(captured?.status).toBe('authenticated');
    });

    seedAdvisorState();
    await act(async () => {
      await captured?.logout();
    });
    expect(captured?.status).toBe('anonymous');
    expect(advisorStatePresent()).toBe(false);
  });
});
