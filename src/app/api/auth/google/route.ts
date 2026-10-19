import { NextResponse } from 'next/server';
import { backendFetch, toProxiedResponse } from '@/lib/api/backend';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_SEC,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_SEC,
  serializeAuthCookie,
} from '@/lib/auth/cookies';
import type { AuthPayload } from '@/lib/api/auth';

export const dynamic = 'force-dynamic';

function isAuthPayload(value: unknown): value is AuthPayload {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  const tokens = record['tokens'];
  return (
    record['user'] !== null &&
    typeof record['user'] === 'object' &&
    tokens !== null &&
    typeof tokens === 'object' &&
    typeof (tokens as Record<string, unknown>)['accessToken'] === 'string' &&
    typeof (tokens as Record<string, unknown>)['refreshToken'] === 'string'
  );
}

/**
 * `POST /api/auth/google` — proxies the GIS ID token to the backend
 * (`POST /auth/google`) and stores the issued tokens as httpOnly cookies,
 * mirroring `/api/auth/login`. Failures keep the backend uniform
 * `{ statusCode, code, message }` shape (401 on invalid credential).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const rawBody = await request.text();
  const result = await backendFetch('/auth/google', {
    method: 'POST',
    rawBody: rawBody.length > 0 ? rawBody : null,
    cookieHeader: request.headers.get('cookie'),
  });
  if (result.status !== 200 || !isAuthPayload(result.body)) {
    return toProxiedResponse(result);
  }
  const response = NextResponse.json({ user: result.body.user }, { status: 200 });
  for (const setCookie of result.setCookies) {
    response.headers.append('set-cookie', setCookie);
  }
  response.headers.append(
    'set-cookie',
    serializeAuthCookie(ACCESS_COOKIE, result.body.tokens.accessToken, ACCESS_MAX_AGE_SEC),
  );
  response.headers.append(
    'set-cookie',
    serializeAuthCookie(REFRESH_COOKIE, result.body.tokens.refreshToken, REFRESH_MAX_AGE_SEC),
  );
  return response;
}
