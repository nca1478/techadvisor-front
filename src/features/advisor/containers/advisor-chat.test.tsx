import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Dictionary } from '@/lib/i18n/index';
import { getDictionarySync } from '@/lib/i18n/index';
import { chatSessionHistoryStorageKey } from '@/lib/api/advisor';
import { AdvisorChat } from './advisor-chat';

const addItemMock = vi.fn(() => Promise.resolve({ ok: true as const }));

vi.mock('@/features/cart/cart-context', () => ({
  useCart: () => ({
    status: 'ready' as const,
    cart: null,
    error: null,
    reload: vi.fn(),
    addItem: addItemMock,
    updateQty: vi.fn(),
    removeItem: vi.fn(),
  }),
}));

const messages: Dictionary = getDictionarySync('es');
const SESSION_KEY = 'techadvisor:advisor-chat:es';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function sseResponse(events: string): Response {
  return new Response(events, { headers: { 'content-type': 'text/event-stream' } });
}

const RECOMMEND_SSE =
  'event: delta\ndata: {"text":"Estas "}\n\n' +
  'event: delta\ndata: {"text":"opciones encajan [1]."}\n\n' +
  'event: products\ndata: {"products":[{"productId":"prod-mock-laptop-13","name":"Mock Laptop 13","slug":"mock-laptop-13","priceAmount":129900,"currency":"USD","inStock":true,"availableQuantity":7,"imageUrl":null,"reason":"16 GB de RAM [1].","citations":[{"n":1,"documentId":"doc-mock-manual","chunkId":"chunk-mock-1","title":"Mock Laptop 13 manual","snippet":"La batería dura 10 horas."}]}]}\n\n' +
  'event: done\ndata: {}\n\n';

function sessionPayload(id = 's1') {
  return {
    id,
    messageCount: 0,
    createdAt: '2026-10-09T12:00:00.000Z',
    updatedAt: '2026-10-09T12:00:00.000Z',
  };
}

beforeEach(() => {
  window.localStorage.clear();
  addItemMock.mockClear();
  vi.unstubAllGlobals();
});

function stubFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => Promise.resolve(handler(url, init))),
  );
}

describe('AdvisorChat', () => {
  it('opens a session, shows starters and streams a recommendation with cart action', async () => {
    const calls: string[] = [];
    stubFetch((url, init) => {
      calls.push(`${init?.method ?? 'GET'} ${url}`);
      if (url === '/api/advisor/sessions') return jsonResponse(201, sessionPayload());
      if (url === '/api/advisor/sessions/s1/messages') return sseResponse(RECOMMEND_SSE);
      return jsonResponse(404, { statusCode: 404, code: 'NOT_FOUND', message: 'x' });
    });

    render(<AdvisorChat locale="es" messages={messages} />);

    // Starters are visible on the empty chat; the session id persists.
    expect(await screen.findByText(messages.chat.startersLabel)).toBeInTheDocument();
    await waitFor(() => {
      expect(window.localStorage.getItem(SESSION_KEY)).toBe('s1');
    });

    fireEvent.change(screen.getByLabelText(messages.chat.inputLabel), {
      target: { value: 'Portátil para estudiar' },
    });
    fireEvent.click(screen.getByRole('button', { name: messages.chat.send }));

    // User bubble + streamed assistant text + hydrated product card.
    // (AdvisorAnswer renders the visible split plus an sr-only full copy.)
    expect(await screen.findByText('Portátil para estudiar')).toBeInTheDocument();
    expect((await screen.findAllByText(/Estas opciones encajan/)).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /Mock Laptop 13/ })).toHaveAttribute(
      'href',
      '/es/productos/mock-laptop-13',
    );

    fireEvent.click(screen.getByRole('button', { name: messages.chat.addToCart }));
    await waitFor(() => {
      expect(addItemMock).toHaveBeenCalledWith('prod-mock-laptop-13');
    });
    expect(calls).toContain('POST /api/advisor/sessions');
    expect(calls).toContain('POST /api/advisor/sessions/s1/messages');
  });

  it('restores the stored conversation after a reload without opening a new session', async () => {
    window.localStorage.setItem(SESSION_KEY, 's1');
    const calls: string[] = [];
    stubFetch((url, init) => {
      calls.push(`${init?.method ?? 'GET'} ${url}`);
      if (url === '/api/advisor/sessions/s1') {
        return jsonResponse(200, {
          ...sessionPayload(),
          messageCount: 2,
          messages: [
            {
              id: 'm1',
              role: 'USER',
              content: 'Portátil para estudiar',
              citations: [],
              products: [],
              createdAt: '2026-10-09T12:00:00.000Z',
            },
            {
              id: 'm2',
              role: 'ASSISTANT',
              content: 'Esta opción encaja [1].',
              citations: [
                {
                  n: 1,
                  documentId: 'doc-mock-manual',
                  chunkId: 'chunk-mock-1',
                  title: 'Mock Laptop 13 manual',
                  snippet: 'La batería dura 10 horas.',
                },
              ],
              products: [
                {
                  productId: 'prod-mock-laptop-13',
                  name: 'Mock Laptop 13',
                  slug: 'mock-laptop-13',
                  priceAmount: 129900,
                  currency: 'USD',
                  inStock: true,
                  availableQuantity: 7,
                  imageUrl: null,
                  reason: '16 GB de RAM [1].',
                  citations: [],
                },
              ],
              createdAt: '2026-10-09T12:01:00.000Z',
            },
          ],
        });
      }
      return jsonResponse(404, { statusCode: 404, code: 'NOT_FOUND', message: 'x' });
    });

    render(<AdvisorChat locale="es" messages={messages} />);

    expect(await screen.findByText('Portátil para estudiar')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mock Laptop 13/ })).toBeInTheDocument();
    expect(calls).toContain('GET /api/advisor/sessions/s1');
    expect(calls).not.toContain('POST /api/advisor/sessions');
  });

  it('keeps the previous conversation selectable after starting a new chat', async () => {
    let seq = 1;
    stubFetch((url, init) => {
      const method = init?.method ?? 'GET';
      if (url === '/api/advisor/sessions' && method === 'GET') return jsonResponse(200, []);
      if (url === '/api/advisor/sessions' && method === 'POST') {
        seq += 1;
        return jsonResponse(201, sessionPayload(`s${String(seq)}`));
      }
      if (url === '/api/advisor/sessions/s2/messages') return sseResponse(RECOMMEND_SSE);
      if (url === '/api/advisor/sessions/s2') {
        return jsonResponse(200, {
          ...sessionPayload('s2'),
          messageCount: 2,
          messages: [
            {
              id: 'm1',
              role: 'USER',
              content: 'Portátil para estudiar',
              citations: [],
              products: [],
              createdAt: '2026-10-09T12:00:00.000Z',
            },
            {
              id: 'm2',
              role: 'ASSISTANT',
              content: 'Estas opciones encajan [1].',
              citations: [],
              products: [],
              createdAt: '2026-10-09T12:01:00.000Z',
            },
          ],
        });
      }
      if (url === '/api/advisor/sessions/s3') {
        return jsonResponse(200, { ...sessionPayload('s3'), messageCount: 0, messages: [] });
      }
      return jsonResponse(404, { statusCode: 404, code: 'NOT_FOUND', message: 'x' });
    });

    render(<AdvisorChat locale="es" messages={messages} />);
    await screen.findByText(messages.chat.startersLabel);

    fireEvent.change(screen.getByLabelText(messages.chat.inputLabel), {
      target: { value: 'Portátil para estudiar' },
    });
    fireEvent.click(screen.getByRole('button', { name: messages.chat.send }));
    expect((await screen.findAllByText(/Estas opciones encajan/)).length).toBeGreaterThanOrEqual(1);

    // Starting a new conversation clears the view but preserves the old one.
    fireEvent.click(screen.getByRole('button', { name: messages.chat.newChat }));
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: messages.chat.historyLabel }),
      ).toBeInTheDocument();
    });
    const history = screen.getByRole('combobox', { name: messages.chat.historyLabel });
    expect(history.querySelectorAll('option')).toHaveLength(2);
    expect(screen.queryByText('Portátil para estudiar')).not.toBeInTheDocument();

    // Switching back restores the previous conversation from the backend.
    fireEvent.change(history, { target: { value: 's2' } });
    expect(await screen.findByText('Portátil para estudiar')).toBeInTheDocument();
    expect((await screen.findAllByText(/Estas opciones encajan/)).length).toBeGreaterThanOrEqual(1);
  });

  it('deletes the current conversation and shows the next surviving one', async () => {
    window.localStorage.setItem(
      chatSessionHistoryStorageKey('es'),
      JSON.stringify([{ id: 's8', preview: 'Guardada anterior' }]),
    );
    const calls: string[] = [];
    const historyPayload = (id: string, userText: string, assistantText: string) => ({
      ...sessionPayload(id),
      messageCount: 2,
      messages: [
        {
          id: `${id}-m1`,
          role: 'USER',
          content: userText,
          citations: [],
          products: [],
          createdAt: '2026-10-09T12:00:00.000Z',
        },
        {
          id: `${id}-m2`,
          role: 'ASSISTANT',
          content: assistantText,
          citations: [],
          products: [],
          createdAt: '2026-10-09T12:01:00.000Z',
        },
      ],
    });
    stubFetch((url, init) => {
      const method = init?.method ?? 'GET';
      calls.push(`${method} ${url}`);
      if (url === '/api/advisor/sessions' && method === 'GET') return jsonResponse(200, []);
      if (url === '/api/advisor/sessions' && method === 'POST') {
        return jsonResponse(201, sessionPayload('s9'));
      }
      if (url === '/api/advisor/sessions/s8') {
        return jsonResponse(200, historyPayload('s8', 'Guardada anterior', 'Respuesta guardada.'));
      }
      if (url === '/api/advisor/sessions/s9' && method === 'DELETE') {
        return new Response(null, { status: 204 });
      }
      if (url === '/api/advisor/sessions/s9') {
        return jsonResponse(200, { ...sessionPayload('s9'), messageCount: 0, messages: [] });
      }
      return jsonResponse(404, { statusCode: 404, code: 'NOT_FOUND', message: 'x' });
    });

    render(<AdvisorChat locale="es" messages={messages} />);
    expect(await screen.findByText('Guardada anterior')).toBeInTheDocument();

    // A new (empty) conversation on top; the old one stays in the selector.
    fireEvent.click(screen.getByRole('button', { name: messages.chat.newChat }));
    await waitFor(() => {
      expect(
        screen
          .getByRole('combobox', { name: messages.chat.historyLabel })
          .querySelectorAll('option'),
      ).toHaveLength(2);
    });
    expect(screen.queryByText('Guardada anterior')).not.toBeInTheDocument();

    // Two-step delete: request, then confirm.
    fireEvent.click(screen.getByRole('button', { name: messages.chat.deleteChat }));
    expect(screen.getByText(messages.chat.deleteConfirm)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: messages.chat.deleteConfirmButton }));

    // The deleted session is gone everywhere; the survivor is restored.
    expect(await screen.findByText('Guardada anterior')).toBeInTheDocument();
    expect(await screen.findByText('Respuesta guardada.')).toBeInTheDocument();
    expect(calls).toContain('DELETE /api/advisor/sessions/s9');
    await waitFor(() => {
      expect(
        screen
          .getByRole('combobox', { name: messages.chat.historyLabel })
          .querySelectorAll('option'),
      ).toHaveLength(1);
    });
    expect(window.localStorage.getItem(SESSION_KEY)).toBe('s8');
  });

  it('deleting the last conversation opens a fresh blank one', async () => {
    let seq = 9;
    stubFetch((url, init) => {
      const method = init?.method ?? 'GET';
      if (url === '/api/advisor/sessions' && method === 'GET') return jsonResponse(200, []);
      if (url === '/api/advisor/sessions' && method === 'POST') {
        seq += 1;
        return jsonResponse(201, sessionPayload(`s${String(seq)}`));
      }
      if (url === '/api/advisor/sessions/s10' && method === 'DELETE') {
        return new Response(null, { status: 204 });
      }
      if (url === '/api/advisor/sessions/s10') {
        return jsonResponse(200, { ...sessionPayload('s10'), messageCount: 0, messages: [] });
      }
      return jsonResponse(404, { statusCode: 404, code: 'NOT_FOUND', message: 'x' });
    });

    render(<AdvisorChat locale="es" messages={messages} />);
    await screen.findByText(messages.chat.startersLabel);

    fireEvent.click(screen.getByRole('button', { name: messages.chat.deleteChat }));
    fireEvent.click(screen.getByRole('button', { name: messages.chat.deleteConfirmButton }));

    // A blank conversation replaces the deleted one; the selector holds only it.
    await waitFor(() => {
      expect(window.localStorage.getItem(SESSION_KEY)).toBe('s11');
    });
    expect(await screen.findByText(messages.chat.startersLabel)).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: messages.chat.historyLabel }).querySelectorAll('option'),
    ).toHaveLength(1);
  });

  it('shows a rate-limit alert with retry that resends without duplicating the question', async () => {
    let attempts = 0;
    stubFetch((url) => {
      if (url === '/api/advisor/sessions') return jsonResponse(201, sessionPayload());
      if (url === '/api/advisor/sessions/s1/messages') {
        attempts += 1;
        if (attempts === 1) {
          return jsonResponse(429, {
            statusCode: 429,
            code: 'TOO_MANY_REQUESTS',
            message: 'Slow down',
          });
        }
        return sseResponse(RECOMMEND_SSE);
      }
      return jsonResponse(404, { statusCode: 404, code: 'NOT_FOUND', message: 'x' });
    });

    render(<AdvisorChat locale="es" messages={messages} />);
    await screen.findByText(messages.chat.startersLabel);

    fireEvent.change(screen.getByLabelText(messages.chat.inputLabel), {
      target: { value: 'Portátil para estudiar' },
    });
    fireEvent.click(screen.getByRole('button', { name: messages.chat.send }));

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.advisor.rateLimitError);
    fireEvent.click(screen.getByRole('button', { name: messages.advisor.retry }));

    expect((await screen.findAllByText(/Estas opciones encajan/)).length).toBeGreaterThanOrEqual(1);
    // The question appears exactly once (user bubbles are not duplicated).
    expect(screen.getAllByText('Portátil para estudiar')).toHaveLength(1);
    expect(attempts).toBe(2);
  });
});
