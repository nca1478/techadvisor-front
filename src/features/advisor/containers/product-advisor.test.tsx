'use client';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDictionarySync } from '@/lib/i18n/index';
import { ProductAdvisor } from './product-advisor';

const messages = getDictionarySync('es').advisor;

interface QaPayload {
  productId?: unknown;
  question?: unknown;
  locale?: unknown;
  sessionId?: unknown;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function citedAnswer() {
  return {
    answer: 'Dura 10 h [1].',
    citations: [{ n: 1, documentId: 'd', chunkId: 'c', title: 'Manual', snippet: 'Diez horas.' }],
    abstained: false,
  };
}

function sessionBody(id: string) {
  return {
    id,
    messageCount: 0,
    createdAt: '2026-10-09T12:00:00.000Z',
    updatedAt: '2026-10-09T12:00:00.000Z',
  };
}

/** Queued fetch mock: sees every BFF call the container makes. */
function mockFetch(handler: (url: string, body: Record<string, unknown>) => Response | null) {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  const fetchMock = vi.fn((url: unknown, init?: RequestInit): Promise<Response> => {
    const raw = typeof init?.body === 'string' ? init.body : '{}';
    const body = JSON.parse(raw) as Record<string, unknown>;
    calls.push({ url: String(url), body });
    return Promise.resolve(
      handler(String(url), body) ?? jsonResponse(500, { message: 'unmocked' }),
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

function renderAdvisor() {
  render(
    <ProductAdvisor
      productId="p1"
      categorySlug={null}
      locale="es"
      supportHref="/es/cuenta"
      messages={messages}
    />,
  );
}

function askQuestion(question: string) {
  fireEvent.change(screen.getByLabelText(messages.questionLabel), { target: { value: question } });
  fireEvent.click(screen.getByRole('button', { name: messages.ask }));
}

function qaBodies(calls: { url: string; body: Record<string, unknown> }[]): QaPayload[] {
  return calls.filter((call) => call.url === '/api/advisor/product-qa').map((call) => call.body);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ProductAdvisor session wiring', () => {
  it('opens a session on mount and sends its id with the question', async () => {
    const calls = mockFetch((url) => {
      if (url === '/api/advisor/sessions') return jsonResponse(201, sessionBody('s1'));
      if (url === '/api/advisor/product-qa') return jsonResponse(200, citedAnswer());
      return null;
    });
    renderAdvisor();

    await waitFor(() => {
      expect(calls.some((call) => call.url === '/api/advisor/sessions')).toBe(true);
    });
    askQuestion('¿Batería?');

    await screen.findByText('Dura 10 h [1].');
    expect(qaBodies(calls)).toHaveLength(1);
    expect(qaBodies(calls)[0]).toMatchObject({ productId: 'p1', sessionId: 's1' });
  });

  it('asks without a session when opening it fails', async () => {
    const calls = mockFetch((url) => {
      if (url === '/api/advisor/sessions') return jsonResponse(500, { message: 'down' });
      if (url === '/api/advisor/product-qa') return jsonResponse(200, citedAnswer());
      return null;
    });
    renderAdvisor();
    askQuestion('¿Batería?');

    await screen.findByText('Dura 10 h [1].');
    expect(qaBodies(calls)).toHaveLength(1);
    expect(qaBodies(calls)[0]).not.toHaveProperty('sessionId');
  });

  it('rotates the session and retries once when it 404s', async () => {
    let sessionsOpened = 0;
    const calls = mockFetch((url, body) => {
      if (url === '/api/advisor/sessions') {
        sessionsOpened += 1;
        return jsonResponse(201, sessionBody(`s${String(sessionsOpened)}`));
      }
      if (url === '/api/advisor/product-qa') {
        if (body['sessionId'] === 's1') {
          return jsonResponse(404, { statusCode: 404, code: 'NOT_FOUND', message: 'gone' });
        }
        return jsonResponse(200, citedAnswer());
      }
      return null;
    });
    renderAdvisor();
    askQuestion('¿Batería?');

    await screen.findByText('Dura 10 h [1].');
    expect(sessionsOpened).toBe(2);
    expect(qaBodies(calls).map((payload) => payload.sessionId)).toEqual(['s1', 's2']);
  });

  it('shows not-found when the rotated session 404s too', async () => {
    let sessionsOpened = 0;
    const calls = mockFetch((url) => {
      if (url === '/api/advisor/sessions') {
        sessionsOpened += 1;
        return jsonResponse(201, sessionBody(`s${String(sessionsOpened)}`));
      }
      if (url === '/api/advisor/product-qa') {
        return jsonResponse(404, { statusCode: 404, code: 'NOT_FOUND', message: 'gone' });
      }
      return null;
    });
    renderAdvisor();
    askQuestion('¿Batería?');

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(messages.notFoundError);
    expect(qaBodies(calls).map((payload) => payload.sessionId)).toEqual(['s1', 's2']);
  });
});
