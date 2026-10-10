import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './errors';
import { createAdvisorApi } from './advisor';
import { createApiClient } from './client';

interface RecordedCall {
  url: string;
  init?: RequestInit;
}

function clientWithFetch(handler: (url: string, init?: RequestInit) => Promise<Response>) {
  return createApiClient({ baseUrl: 'http://test', fetchFn: handler as typeof fetch });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function okHandler(body: unknown): { fetchFn: typeof fetch; calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  const fetchFn = vi.fn((url: string, init?: RequestInit): Promise<Response> => {
    calls.push({ url, init });
    return Promise.resolve(jsonResponse(200, body));
  });
  return { fetchFn: fetchFn as unknown as typeof fetch, calls };
}

function errorHandler(status: number, body: unknown): typeof fetch {
  return () => Promise.resolve(jsonResponse(status, body));
}

describe('createAdvisorApi', () => {
  it('parses a cited answer', async () => {
    const { fetchFn, calls } = okHandler({
      answer: 'La batería dura 10 h [1].',
      citations: [
        { n: 1, documentId: 'd1', chunkId: 'c1', title: 'Manual X', snippet: 'Batería 10 h' },
      ],
      abstained: false,
    });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    const res = await api.askProduct({ productId: 'p1', question: '¿Batería?', locale: 'es' });
    expect(res.abstained).toBe(false);
    expect(res.citations).toHaveLength(1);
    expect(calls[0]?.url).toBe('http://test/advisor/product-qa');
    const rawBody = calls[0]?.init?.body;
    expect(typeof rawBody === 'string' && rawBody.includes('p1')).toBe(true);
  });

  it('forwards an owned sessionId when provided', async () => {
    const { fetchFn, calls } = okHandler({ answer: 'Ok [1].', citations: [], abstained: false });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    await api.askProduct({
      productId: 'p1',
      question: '¿Batería?',
      locale: 'es',
      sessionId: 'session-1',
    });
    const rawBody = calls[0]?.init?.body;
    expect(typeof rawBody === 'string' && rawBody.includes('session-1')).toBe(true);
  });

  it('creates a chat session and parses it', async () => {
    const { fetchFn, calls } = okHandler({
      id: 'session-1',
      messageCount: 0,
      createdAt: '2026-10-09T12:00:00.000Z',
      updatedAt: '2026-10-09T12:00:00.000Z',
    });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    const session = await api.createSession();
    expect(session).toMatchObject({ id: 'session-1', messageCount: 0 });
    expect(calls[0]?.url).toBe('http://test/advisor/sessions');
  });

  it('rejects malformed sessions instead of using them', async () => {
    const { fetchFn } = okHandler({ id: 42 });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    await expect(api.createSession()).rejects.toThrow('Invalid chat session shape');
  });

  it('parses an abstention distinctly', async () => {
    const { fetchFn } = okHandler({
      answer: 'No tengo esa información.',
      citations: [],
      abstained: true,
    });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    const res = await api.askProduct({ productId: 'p1', question: '¿Cuánto pesa en Marte?' });
    expect(res.abstained).toBe(true);
    expect(res.citations).toHaveLength(0);
  });

  it('propagates rate-limit errors as ApiError 429', async () => {
    const api = createAdvisorApi(
      clientWithFetch(
        errorHandler(429, { statusCode: 429, code: 'TOO_MANY_REQUESTS', message: 'Slow down' }),
      ),
    );
    await expect(api.askProduct({ productId: 'p1', question: 'hola' })).rejects.toMatchObject({
      statusCode: 429,
    });
  });

  it('rejects malformed payloads instead of rendering them', async () => {
    const { fetchFn } = okHandler({ answer: 42 });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    await expect(api.askProduct({ productId: 'p1', question: 'hola' })).rejects.toThrow(
      'Invalid advisor response shape',
    );
  });

  it('validates feedback bodies with zod before sending', () => {
    const { fetchFn, calls } = okHandler({ ok: true });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    expect(() =>
      api.sendFeedback({
        productId: 'p1',
        question: '',
        answer: 'a',
        abstained: false,
        value: 'up',
      }),
    ).toThrow();
    expect(calls).toHaveLength(0);
  });

  it('sends valid feedback to the stub endpoint', async () => {
    const { fetchFn, calls } = okHandler({ ok: true });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    const res = await api.sendFeedback({
      productId: 'p1',
      question: '¿Batería?',
      answer: 'Dura 10 h [1].',
      abstained: false,
      value: 'down',
    });
    expect(res).toEqual({ ok: true });
    expect(calls[0]?.url).toBe('http://test/advisor/feedback');
  });

  it('keeps ApiError identity for provider outages (503)', async () => {
    const api = createAdvisorApi(
      clientWithFetch(
        errorHandler(503, {
          statusCode: 503,
          code: 'SERVICE_UNAVAILABLE',
          message: 'Provider down',
        }),
      ),
    );
    const error = await api
      .askProduct({ productId: 'p1', question: 'hola' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('SERVICE_UNAVAILABLE');
  });
});
