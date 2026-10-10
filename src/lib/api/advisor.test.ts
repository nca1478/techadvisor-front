import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './errors';
import {
  asAdvisorCitation,
  asRecommendProduct,
  chatSessionHistoryStorageKey,
  chatSessionStorageKey,
  classifyAdvisorError,
  createAdvisorApi,
  migrateLegacyChatSession,
  parseChatHistory,
  parseChatSessionList,
  parseRecommendResponse,
  parseSseFrames,
  readChatSessionHistory,
  removeChatSessionFromHistory,
  streamRecommendation,
  truncateSessionPreview,
  upsertChatSessionHistory,
} from './advisor';
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

  it('parses a recommendation with hydrated product cards', async () => {
    const { fetchFn, calls } = okHandler({
      message: 'Estas opciones encajan [1].',
      products: [
        {
          productId: 'prod-1',
          name: 'Mock Laptop 13',
          slug: 'mock-laptop-13',
          priceAmount: 129900,
          currency: 'USD',
          inStock: true,
          availableQuantity: 7,
          imageUrl: null,
          reason: '16 GB de RAM [1].',
          citations: [
            { n: 1, documentId: 'd1', chunkId: 'c1', title: 'Manual', snippet: 'Batería 10 h' },
          ],
        },
      ],
    });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    const res = await api.recommend('session-1', {
      content: 'Portátil para estudiar',
      locale: 'es',
    });
    expect(res.products).toHaveLength(1);
    expect(res.products[0]?.priceAmount).toBe(129900);
    expect(res.clarifyingQuestion).toBeUndefined();
    expect(calls[0]?.url).toBe('http://test/advisor/sessions/session-1/messages');
  });

  it('parses a clarification without products', async () => {
    const { fetchFn } = okHandler({
      message: '¿Cuál es tu presupuesto máximo?',
      products: [],
      clarifyingQuestion: '¿Cuál es tu presupuesto máximo?',
    });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    const res = await api.recommend('session-1', { content: 'Hola' });
    expect(res.products).toHaveLength(0);
    expect(res.clarifyingQuestion).toBe('¿Cuál es tu presupuesto máximo?');
  });

  it('rejects recommendations with non-integer prices', async () => {
    const { fetchFn } = okHandler({
      message: 'Mira esto.',
      products: [
        {
          productId: 'prod-1',
          name: 'X',
          slug: 'x',
          priceAmount: 12.99,
          currency: 'USD',
          inStock: true,
          availableQuantity: 1,
          imageUrl: null,
          reason: 'ok',
          citations: [],
        },
      ],
    });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    await expect(api.recommend('session-1', { content: 'Hola' })).rejects.toThrow(
      'Invalid recommend response shape',
    );
  });

  it('parses chat history with messages', async () => {
    const { fetchFn, calls } = okHandler({
      id: 'session-1',
      messageCount: 2,
      createdAt: '2026-10-09T12:00:00.000Z',
      updatedAt: '2026-10-09T12:00:00.000Z',
      messages: [
        {
          id: 'm1',
          role: 'USER',
          content: 'Hola',
          citations: [],
          products: [],
          createdAt: '2026-10-09T12:00:00.000Z',
        },
      ],
    });
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    const history = await api.getSessionHistory('session-1');
    expect(history.messages).toHaveLength(1);
    expect(history.messages[0]?.role).toBe('USER');
    expect(calls[0]?.url).toBe('http://test/advisor/sessions/session-1');
  });

  it('rejects malformed chat history', () => {
    expect(() => parseChatHistory({ id: 's1' })).toThrow('Invalid chat history shape');
    expect(() => parseRecommendResponse({ message: 'x', products: [{ productId: 42 }] })).toThrow(
      'Invalid recommend response shape',
    );
  });

  it('narrows stored product cards and drops unknown shapes', () => {
    expect(
      asRecommendProduct({
        productId: 'p1',
        name: 'X',
        slug: 'x',
        priceAmount: 100,
        currency: 'USD',
        inStock: true,
        availableQuantity: 1,
        imageUrl: null,
        reason: 'ok',
        citations: [],
      })?.slug,
    ).toBe('x');
    expect(asRecommendProduct({ productId: 'p1' })).toBeNull();
    expect(asRecommendProduct(null)).toBeNull();
  });

  it('narrows stored citations and drops unknown shapes', () => {
    expect(
      asAdvisorCitation({ n: 1, documentId: 'd', chunkId: 'c', title: 'T', snippet: 'S' })?.title,
    ).toBe('T');
    expect(asAdvisorCitation({ n: 'uno' })).toBeNull();
  });

  it('delivers a buffered JSON answer when the server skips SSE', async () => {
    const fetchFn = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: 'Hola.', products: [] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )) as unknown as typeof fetch;
    const deltas: string[] = [];
    const result = await streamRecommendation(
      'http://test/messages',
      { content: 'hola' },
      {
        onDelta: (text) => {
          deltas.push(text);
        },
        fetchFn,
      },
    );
    expect(deltas).toEqual(['Hola.']);
    expect(result.products).toHaveLength(0);
  });

  it('builds a stable per-locale storage key', () => {
    expect(chatSessionStorageKey('es')).toBe('techadvisor:advisor-chat:es');
    expect(chatSessionStorageKey('en')).not.toBe(chatSessionStorageKey('es'));
  });

  it('parses a session list and rejects malformed ones', async () => {
    const { fetchFn, calls } = okHandler([
      {
        id: 's1',
        messageCount: 2,
        createdAt: '2026-10-09T12:00:00.000Z',
        updatedAt: '2026-10-09T12:01:00.000Z',
      },
    ]);
    const api = createAdvisorApi(clientWithFetch(fetchFn));
    const list = await api.listSessions();
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe('s1');
    expect(calls[0]?.url).toBe('http://test/advisor/sessions');
    expect(() => parseChatSessionList([{ id: 42 }])).toThrow('Invalid chat session list shape');
  });

  it('keeps a deduplicated, capped browser history and migrates the legacy slot', () => {
    window.localStorage.clear();
    expect(readChatSessionHistory('es')).toEqual([]);
    window.localStorage.setItem(chatSessionStorageKey('es'), 'legacy-1');
    expect(migrateLegacyChatSession('es')).toBe('legacy-1');
    expect(readChatSessionHistory('es').map((entry) => entry.id)).toEqual(['legacy-1']);
    // Migrating twice does not duplicate.
    expect(migrateLegacyChatSession('es')).toBe('legacy-1');
    expect(readChatSessionHistory('es')).toHaveLength(1);

    upsertChatSessionHistory('es', { id: 's2', preview: 'Portátil para estudiar' });
    expect(readChatSessionHistory('es').map((entry) => entry.id)).toEqual(['s2', 'legacy-1']);
    // Re-upserting moves to the front and refreshes the current-session slot.
    upsertChatSessionHistory('es', { id: 'legacy-1' });
    expect(readChatSessionHistory('es').map((entry) => entry.id)).toEqual(['legacy-1', 's2']);
    expect(window.localStorage.getItem(chatSessionStorageKey('es'))).toBe('legacy-1');

    removeChatSessionFromHistory('es', 'legacy-1');
    expect(readChatSessionHistory('es').map((entry) => entry.id)).toEqual(['s2']);

    expect(chatSessionHistoryStorageKey('es')).not.toBe(chatSessionHistoryStorageKey('en'));
    window.localStorage.clear();
  });

  it('truncates session previews to a single line', () => {
    expect(truncateSessionPreview('  Hola\nmundo  ')).toBe('Hola mundo');
    expect(truncateSessionPreview('x'.repeat(100), 60)).toHaveLength(60);
  });

  it('classifies advisor errors by status and code', () => {
    expect(classifyAdvisorError(429, null)).toBe('rate-limit');
    expect(classifyAdvisorError(500, { code: 'TOO_MANY_REQUESTS' })).toBe('rate-limit');
    expect(classifyAdvisorError(404, null)).toBe('not-found');
    expect(classifyAdvisorError(503, null)).toBe('provider');
    expect(classifyAdvisorError(0, null)).toBe('network');
    expect(classifyAdvisorError(500, null)).toBe('generic');
  });

  it('parses SSE frames ignoring malformed chunks', () => {
    const frames = parseSseFrames(
      'event: delta\ndata: {"text":"Hola "}\n\nevent: delta\ndata: {"text":"mundo"}\n\ngarbage\n\nevent: products\ndata: {"products":[]}\n\n',
    );
    expect(frames).toHaveLength(3);
    expect(frames[0]).toEqual({ event: 'delta', data: '{"text":"Hola "}' });
  });

  it('streams deltas and validated products over SSE', async () => {
    const sse =
      'event: delta\ndata: {"text":"Estas "}\n\n' +
      'event: delta\ndata: {"text":"opciones."}\n\n' +
      'event: products\ndata: {"products":[{"productId":"p1","name":"X","slug":"x","priceAmount":100,"currency":"USD","inStock":true,"availableQuantity":1,"imageUrl":null,"reason":"ok","citations":[]}]}\n\n' +
      'event: done\ndata: {}\n\n';
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sse));
        controller.close();
      },
    });
    const fetchFn = vi.fn(() =>
      Promise.resolve(new Response(stream, { headers: { 'content-type': 'text/event-stream' } })),
    ) as unknown as typeof fetch;
    const deltas: string[] = [];
    const result = await streamRecommendation(
      'http://test/messages',
      { content: 'hola' },
      {
        onDelta: (text) => {
          deltas.push(text);
        },
        fetchFn,
      },
    );
    expect(deltas).toEqual(['Estas ', 'opciones.']);
    expect(result.products).toHaveLength(1);
    expect(result.products[0]?.priceAmount).toBe(100);
    expect(fetchFn).toHaveBeenCalledWith(
      'http://test/messages',
      expect.objectContaining({
        headers: expect.objectContaining({ accept: 'text/event-stream' }),
      }),
    );
  });

  it('drops invalid SSE product cards instead of rendering them', async () => {
    const sse =
      'event: delta\ndata: {"text":"Hola"}\n\n' +
      'event: products\ndata: {"products":[{"productId":"p1"}]}\n\n' +
      'event: done\ndata: {}\n\n';
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sse));
        controller.close();
      },
    });
    const fetchFn = (() => Promise.resolve(new Response(stream))) as unknown as typeof fetch;
    const result = await streamRecommendation(
      'http://test/messages',
      { content: 'hola' },
      {
        onDelta: () => {},
        fetchFn,
      },
    );
    expect(result.products).toHaveLength(0);
  });

  it('carries status and body on stream failures for classification', async () => {
    const fetchFn = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ statusCode: 429, code: 'TOO_MANY_REQUESTS', message: 'x' }), {
          status: 429,
          headers: { 'content-type': 'application/json' },
        }),
      )) as unknown as typeof fetch;
    const error = await streamRecommendation(
      'http://test/messages',
      { content: 'hola' },
      {
        onDelta: () => {},
        fetchFn,
      },
    ).catch((e: unknown) => e);
    expect((error as { status?: number }).status).toBe(429);
    expect(
      classifyAdvisorError(
        (error as { status?: number }).status ?? 0,
        (error as { body?: unknown }).body,
      ),
    ).toBe('rate-limit');
  });
});
