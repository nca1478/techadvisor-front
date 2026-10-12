import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/**
 * `PATCH /api/account/profile` — updates the caller's own name and password.
 * Proxied to backend `PATCH /users/me`; the email is never part of the
 * payload and cannot change through this endpoint.
 */
export async function PATCH(request: Request) {
  return proxyToBackend(request, '/users/me');
}
