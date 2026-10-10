import 'server-only';

import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_SEC,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_SEC,
  serializeAuthCookie,
} from '@/lib/auth/cookies';
import type { TokenPair } from '@/lib/api/auth';

/** Backend base URL for server-side code (never exposed to the browser). */
export function backendBaseUrl(): string {
  const fromEnv = process.env['API_BASE_URL'] ?? 'http://localhost:3001/api/v1';
  return fromEnv.replace(/\/+$/, '');
}

export interface BackendResult {
  status: number;
  body: unknown;
  /** Raw `Set-Cookie` values collected from the backend (e.g. `sid`). */
  setCookies: string[];
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

function readTokens(cookieHeader: string | null): Tokens {
  const get = (name: string): string | null => {
    if (!cookieHeader) return null;
    for (const part of cookieHeader.split(';')) {
      const eq = part.indexOf('=');
      if (eq <= 0) continue;
      if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
    }
    return null;
  };
  return {
    accessToken: get(ACCESS_COOKIE) ?? '',
    refreshToken: get(REFRESH_COOKIE) ?? '',
  };
}

function readSid(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    if (part.slice(0, eq).trim() === 'sid') return part.slice(eq + 1).trim();
  }
  return null;
}

function isTokenPair(value: unknown): value is TokenPair {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record['accessToken'] === 'string' && typeof record['refreshToken'] === 'string';
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.length === 0) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function collectSetCookies(res: Response): string[] {
  if (typeof res.headers.getSetCookie === 'function') {
    return res.headers.getSetCookie();
  }
  const single = res.headers.get('set-cookie');
  return single ? [single] : [];
}

interface CallBackendOptions {
  accessToken: string;
  sid: string | null;
  method: string;
  rawBody: string | null;
  setCookies: string[];
}

/** One backend call with the caller's auth/guest cookies attached. */
async function callBackend(
  backendPath: string,
  options: CallBackendOptions,
): Promise<{ status: number; body: unknown; setCookies: string[] }> {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (options.accessToken) {
    headers.set('authorization', `Bearer ${options.accessToken}`);
  }
  if (options.sid) {
    headers.set('cookie', `sid=${options.sid}`);
  }
  const res = await fetch(`${backendBaseUrl()}${backendPath}`, {
    method: options.method,
    headers,
    body: options.rawBody,
    redirect: 'manual',
  });
  const body = await parseBody(res);
  return {
    status: res.status,
    body,
    setCookies: [...options.setCookies, ...collectSetCookies(res)],
  };
}

/**
 * Forwards the request to the backend with the caller's `ta_access` (as
 * `Authorization: Bearer`) and `sid` cookies. On a 401 with a refresh token
 * available, it rotates the pair once (`POST /auth/refresh`) and retries the
 * original call — so short-lived access tokens never surface to the browser.
 */
export async function backendFetch(
  backendPath: string,
  init: { method?: string; rawBody?: string | null; cookieHeader?: string | null } = {},
): Promise<BackendResult> {
  const cookieHeader = init.cookieHeader ?? null;
  const tokens = readTokens(cookieHeader);
  const sid = readSid(cookieHeader);
  const method = init.method ?? 'GET';
  const rawBody = init.rawBody ?? null;

  const first = await callBackend(backendPath, {
    accessToken: tokens.accessToken,
    sid,
    method,
    rawBody,
    setCookies: [],
  });
  if (first.status !== 401 || !tokens.refreshToken) {
    return first;
  }

  const refreshRes = await fetch(`${backendBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    redirect: 'manual',
  });
  const refreshBody = await parseBody(refreshRes);
  const rotated =
    refreshRes.ok &&
    refreshBody !== null &&
    typeof refreshBody === 'object' &&
    isTokenPair((refreshBody as Record<string, unknown>)['tokens']);
  if (!rotated) {
    return first;
  }
  const next = (refreshBody as { tokens: TokenPair }).tokens;
  const rotatedCookies = [
    ...first.setCookies,
    ...collectSetCookies(refreshRes),
    serializeAuthCookie(ACCESS_COOKIE, next.accessToken, ACCESS_MAX_AGE_SEC),
    serializeAuthCookie(REFRESH_COOKIE, next.refreshToken, REFRESH_MAX_AGE_SEC),
  ];
  return callBackend(backendPath, {
    accessToken: next.accessToken,
    sid,
    method,
    rawBody,
    setCookies: rotatedCookies,
  });
}

/** Builds the `NextResponse` for a proxied backend result, forwarding cookies. */
export function toProxiedResponse(result: BackendResult): NextResponse {
  const response = NextResponse.json(result.body, { status: result.status });
  for (const setCookie of result.setCookies) {
    response.headers.append('set-cookie', setCookie);
  }
  return response;
}

/**
 * Generic same-origin proxy: forwards method + raw body + caller cookies to
 * the backend path and streams status/body/cookies back. Used by the
 * cart/orders/payments `/api/*` handlers.
 */
export async function proxyToBackend(request: Request, backendPath: string): Promise<NextResponse> {
  const rawBody =
    request.method === 'GET' || request.method === 'HEAD' ? null : await request.text();
  const result = await backendFetch(backendPath, {
    method: request.method,
    rawBody: rawBody && rawBody.length > 0 ? rawBody : null,
    cookieHeader: request.headers.get('cookie'),
  });
  return toProxiedResponse(result);
}

async function rotateRefreshToken(refreshToken: string): Promise<{
  tokens: TokenPair;
  setCookies: string[];
} | null> {
  const refreshRes = await fetch(`${backendBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    redirect: 'manual',
  });
  const refreshBody = await parseBody(refreshRes);
  const rotated =
    refreshRes.ok &&
    refreshBody !== null &&
    typeof refreshBody === 'object' &&
    isTokenPair((refreshBody as Record<string, unknown>)['tokens']);
  if (!rotated) return null;
  return {
    tokens: (refreshBody as { tokens: TokenPair }).tokens,
    setCookies: [
      ...collectSetCookies(refreshRes),
      serializeAuthCookie(
        ACCESS_COOKIE,
        (refreshBody as { tokens: TokenPair }).tokens.accessToken,
        ACCESS_MAX_AGE_SEC,
      ),
      serializeAuthCookie(
        REFRESH_COOKIE,
        (refreshBody as { tokens: TokenPair }).tokens.refreshToken,
        REFRESH_MAX_AGE_SEC,
      ),
    ],
  };
}

/**
 * Streaming variant of `proxyToBackend` for SSE endpoints (e.g. the advisor
 * recommendation stream). Forwards method + raw body + caller cookies + the
 * caller's `Accept` header and pipes the upstream bytes through untouched —
 * never buffered or JSON-parsed — while still forwarding `set-cookie`
 * (guest `sid`, rotated auth) to the browser. Includes the same single
 * refresh-and-retry as `backendFetch`.
 */
export async function proxyStreamToBackend(
  request: Request,
  backendPath: string,
): Promise<Response> {
  const cookieHeader = request.headers.get('cookie');
  const tokens = readTokens(cookieHeader);
  const sid = readSid(cookieHeader);
  const rawBody =
    request.method === 'GET' || request.method === 'HEAD' ? null : await request.text();
  const accept = request.headers.get('accept') ?? 'application/json';

  async function send(accessToken: string): Promise<Response> {
    const headers = new Headers({ 'content-type': 'application/json', accept });
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }
    if (sid) {
      headers.set('cookie', `sid=${sid}`);
    }
    return fetch(`${backendBaseUrl()}${backendPath}`, {
      method: request.method,
      headers,
      body: rawBody && rawBody.length > 0 ? rawBody : null,
      redirect: 'manual',
    });
  }

  let upstream = await send(tokens.accessToken);
  let extraCookies: string[] = [];
  if (upstream.status === 401 && tokens.refreshToken) {
    const rotated = await rotateRefreshToken(tokens.refreshToken);
    if (rotated) {
      extraCookies = rotated.setCookies;
      upstream = await send(rotated.tokens.accessToken);
    }
  }

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const cacheControl = upstream.headers.get('cache-control');
  if (cacheControl) headers.set('cache-control', cacheControl);
  for (const setCookie of [...collectSetCookies(upstream), ...extraCookies]) {
    headers.append('set-cookie', setCookie);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}

/**
 * Binary-aware variant of `proxyToBackend` for multipart uploads
 * (e.g. `POST /admin/documents/upload`). Forwards the raw bytes with the
 * original `content-type` (boundary included) and the caller cookies;
 * `request.text()` is never used so file bytes survive intact. Includes
 * the same single refresh-and-retry as `backendFetch`.
 */
export async function proxyMultipartToBackend(
  request: Request,
  backendPath: string,
): Promise<NextResponse> {
  const cookieHeader = request.headers.get('cookie');
  const tokens = readTokens(cookieHeader);
  const sid = readSid(cookieHeader);
  const contentType = request.headers.get('content-type') ?? 'application/octet-stream';
  const raw = Buffer.from(await request.arrayBuffer());

  async function send(accessToken: string): Promise<Response> {
    const headers = new Headers({ 'content-type': contentType });
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }
    if (sid) {
      headers.set('cookie', `sid=${sid}`);
    }
    return fetch(`${backendBaseUrl()}${backendPath}`, {
      method: request.method,
      headers,
      body: raw,
      redirect: 'manual',
    });
  }

  const first = await send(tokens.accessToken);
  if (first.status !== 401 || !tokens.refreshToken) {
    return toProxiedResponse({
      status: first.status,
      body: await parseBody(first),
      setCookies: collectSetCookies(first),
    });
  }

  const refreshRes = await fetch(`${backendBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    redirect: 'manual',
  });
  const refreshBody = await parseBody(refreshRes);
  const rotated =
    refreshRes.ok &&
    refreshBody !== null &&
    typeof refreshBody === 'object' &&
    isTokenPair((refreshBody as Record<string, unknown>)['tokens']);
  if (!rotated) {
    return toProxiedResponse({
      status: first.status,
      body: await parseBody(first),
      setCookies: collectSetCookies(first),
    });
  }
  const next = (refreshBody as { tokens: TokenPair }).tokens;
  const retry = await send(next.accessToken);
  return toProxiedResponse({
    status: retry.status,
    body: await parseBody(retry),
    setCookies: [
      ...collectSetCookies(first),
      ...collectSetCookies(refreshRes),
      serializeAuthCookie(ACCESS_COOKIE, next.accessToken, ACCESS_MAX_AGE_SEC),
      serializeAuthCookie(REFRESH_COOKIE, next.refreshToken, REFRESH_MAX_AGE_SEC),
    ],
  });
}
