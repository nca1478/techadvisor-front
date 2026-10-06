import { createApiClient } from './client';
import { ApiError } from './errors';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('createApiClient', () => {
  it('returns parsed JSON on success', async () => {
    const fetchFn = vi.fn((): Promise<Response> =>
      Promise.resolve(jsonResponse({ status: 'ok', db: 'up' })),
    );
    const client = createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn });

    await expect(client.get('/health')).resolves.toEqual({ status: 'ok', db: 'up' });
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/v1/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('throws ApiError with the uniform payload on error responses', async () => {
    const fetchFn = vi.fn((): Promise<Response> =>
      Promise.resolve(jsonResponse({ statusCode: 404, code: 'NOT_FOUND', message: 'Nope' }, 404)),
    );
    const client = createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn });

    const error = await client.get('/missing').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(404);
    expect((error as ApiError).code).toBe('NOT_FOUND');
    expect((error as ApiError).message).toBe('Nope');
  });

  it('throws ApiError with UNKNOWN_ERROR when the body is not the uniform shape', async () => {
    const fetchFn = vi.fn((): Promise<Response> =>
      Promise.resolve(new Response('<html>proxy</html>', { status: 502 })),
    );
    const client = createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn });

    const error = await client.get('/health').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(502);
    expect((error as ApiError).code).toBe('UNKNOWN_ERROR');
  });

  it('throws ApiError with NETWORK_ERROR when fetch rejects', async () => {
    const fetchFn = vi.fn((): Promise<Response> => Promise.reject(new Error('connection reset')));
    const client = createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn });

    const error = await client.get('/health').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('NETWORK_ERROR');
    expect((error as ApiError).message).toBe('connection reset');
  });
});
