import 'server-only';

import { cookies } from 'next/headers';
import type { AuthUser } from '@/lib/api/auth';
import { backendFetch } from '@/lib/api/backend';

export interface Session {
  authenticated: boolean;
  user: AuthUser | null;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record['id'] === 'string' && typeof record['email'] === 'string';
}

/**
 * Resolves the current session server-side from the httpOnly auth cookies.
 * Returns `{ authenticated: false }` when there is no usable session (no
 * token, refresh rejected) — callers turn that into a login redirect.
 */
export async function getSessionUser(): Promise<Session> {
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  if (!cookieHeader) {
    return { authenticated: false, user: null };
  }
  const result = await backendFetch('/users/me', {
    method: 'GET',
    cookieHeader,
  });
  if (result.status !== 200 || !isAuthUser(result.body)) {
    return { authenticated: false, user: null };
  }
  return { authenticated: true, user: result.body };
}
