import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { ACCESS_COOKIE, REFRESH_COOKIE, serializeClearedAuthCookie } from '@/lib/auth/cookies';

export const dynamic = 'force-dynamic';

function readRefreshToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    if (part.slice(0, eq).trim() === REFRESH_COOKIE) return part.slice(eq + 1).trim();
  }
  return null;
}

/**
 * `POST /api/auth/logout` — revokes the refresh token in the backend and
 * clears both auth cookies. Always resolves (idempotent from the browser).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get('cookie');
  const refreshToken = readRefreshToken(cookieHeader);
  if (refreshToken) {
    await backendFetch('/auth/logout', {
      method: 'POST',
      rawBody: JSON.stringify({ refreshToken }),
      cookieHeader,
    });
  }
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.headers.append('set-cookie', serializeClearedAuthCookie(ACCESS_COOKIE));
  response.headers.append('set-cookie', serializeClearedAuthCookie(REFRESH_COOKIE));
  return response;
}
