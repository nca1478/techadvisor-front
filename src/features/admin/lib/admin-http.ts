'use client';

/**
 * Same-origin client for the admin BFF (`/api/admin/*`). Tokens stay in
 * httpOnly cookies; this module only ever sees JSON payloads. Failures throw
 * `AdminHttpError` built from the backend uniform
 * `{ statusCode, code, message }` shape (or a synthetic one for network
 * errors), so containers can render `message` directly.
 */

export class AdminHttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AdminHttpError';
    this.status = status;
    this.code = code;
  }
}

function errorFromBody(status: number, body: unknown): AdminHttpError {
  if (body !== null && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    const code = typeof record['code'] === 'string' ? record['code'] : 'UNKNOWN_ERROR';
    const message =
      typeof record['message'] === 'string'
        ? record['message']
        : `Request failed (${String(status)})`;
    return new AdminHttpError(status, code, message);
  }
  return new AdminHttpError(status, 'UNKNOWN_ERROR', `Request failed (${String(status)})`);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('content-type', 'application/json');
  let res: Response;
  try {
    res = await fetch(`/api/admin${path}`, { ...init, credentials: 'same-origin', headers });
  } catch (error) {
    throw new AdminHttpError(
      0,
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network error',
    );
  }
  if (res.status === 204) return undefined as T;
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw errorFromBody(res.status, body);
  return body as T;
}

export const adminHttp = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: async (path: string): Promise<void> => {
    await request<unknown>(path, { method: 'DELETE' });
  },
  /**
   * Multipart upload through the same BFF (`/api/admin/*`). Unlike
   * `request`, it never sets `content-type`: the browser adds the
   * multipart boundary itself, and the BFF forwards the raw bytes.
   */
  postForm: async <T>(path: string, form: FormData): Promise<T> => {
    let res: Response;
    try {
      res = await fetch(`/api/admin${path}`, {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      });
    } catch (error) {
      throw new AdminHttpError(
        0,
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Network error',
      );
    }
    if (res.status === 204) return undefined as T;
    const body: unknown = await res.json().catch(() => null);
    if (!res.ok) throw errorFromBody(res.status, body);
    return body as T;
  },
};

export function adminErrorMessage(error: unknown, fallback: string): string {
  return error instanceof AdminHttpError ? error.message : fallback;
}
