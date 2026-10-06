import { ApiError, isUniformErrorBody } from './errors.js';

export interface ApiClientOptions {
  /** Defaults to NEXT_PUBLIC_API_BASE_URL (browser) or API_BASE_URL (server). */
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

function resolveBaseUrl(explicit?: string): string {
  if (explicit) return explicit.replace(/\/+$/, '');
  const fromEnv =
    process.env['NEXT_PUBLIC_API_BASE_URL'] ??
    process.env['API_BASE_URL'] ??
    'http://localhost:3001/api/v1';
  return fromEnv.replace(/\/+$/, '');
}

/**
 * Minimal fetch-based API client. Only successful (2xx) JSON responses are
 * returned; anything else throws an `ApiError` built from the backend's
 * uniform `{ statusCode, code, message, details? }` payload (or a synthetic
 * one when the body is not JSON / has another shape, e.g. proxies).
 */
export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = resolveBaseUrl(options.baseUrl);
  const fetchFn = options.fetchFn ?? fetch;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set('content-type', 'application/json');
    let res: Response;
    try {
      res = await fetchFn(`${baseUrl}${path}`, { ...init, headers });
    } catch (error) {
      throw new ApiError({
        statusCode: 0,
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
      });
    }

    if (res.ok) {
      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    }

    const statusCode = res.status;
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    if (isUniformErrorBody(body)) {
      throw new ApiError(body);
    }
    throw new ApiError({
      statusCode,
      code: 'UNKNOWN_ERROR',
      message: `Request failed with status ${String(statusCode)}`,
      details: body,
    });
  }

  return {
    baseUrl,
    get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
    post: <T>(path: string, body?: unknown, init?: RequestInit) =>
      request<T>(path, {
        ...init,
        method: 'POST',
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
