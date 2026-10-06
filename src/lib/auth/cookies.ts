import 'server-only';

/**
 * Auth cookie contract for the Next.js BFF (see ADR 0007). The backend
 * issues tokens in the JSON body (no auth cookies of its own), so these
 * httpOnly cookies — set only by `src/app/api/auth/*` route handlers — are
 * the single place where `accessToken`/`refreshToken` live. Browser code
 * never reads them; every authenticated call goes through the same-origin
 * `/api/*` handlers, which inject `Authorization: Bearer` server-side.
 */
export const ACCESS_COOKIE = 'ta_access';
export const REFRESH_COOKIE = 'ta_refresh';

/** Access cookie lifetime mirrors the backend JWT ttl (15 min). */
export const ACCESS_MAX_AGE_SEC = 15 * 60;

/** Refresh cookie lifetime (30 days, rolling on every refresh). */
export const REFRESH_MAX_AGE_SEC = 30 * 24 * 60 * 60;

function cookieFlags(maxAge: number): string {
  const secure = process.env['NODE_ENV'] === 'production' ? '; Secure' : '';
  return `HttpOnly; Path=/; Max-Age=${String(maxAge)}; SameSite=Lax${secure}`;
}

/** Serializes an auth `Set-Cookie` value (also used for test assertions). */
export function serializeAuthCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; ${cookieFlags(maxAge)}`;
}

/** Serializes an expired auth cookie (logout). */
export function serializeClearedAuthCookie(name: string): string {
  return `${name}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
