'use client';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDictionarySync } from '@/lib/i18n/index';
import { SupportAssistant } from './support-assistant';

const messages = getDictionarySync('es').support;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function citedAnswer() {
  return {
    answer: 'Los portátiles tienen 2 años de garantía [1].',
    citations: [{ n: 1, documentId: 'd', chunkId: 'c', title: 'Garantía', snippet: 'Dos años.' }],
    abstained: false,
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

function renderAssistant() {
  render(<SupportAssistant locale="es" messages={messages} />);
}

function askQuestion(question: string, orderId = '') {
  fireEvent.change(screen.getByLabelText(messages.questionLabel), { target: { value: question } });
  if (orderId !== '') {
    fireEvent.change(screen.getByLabelText(messages.orderIdLabel), { target: { value: orderId } });
  }
  fireEvent.click(screen.getByRole('button', { name: messages.ask }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SupportAssistant', () => {
  it('answers with a citation and no orderId when the field is empty', async () => {
    const calls = mockFetch((url) => {
      if (url === '/api/advisor/support') return jsonResponse(200, citedAnswer());
      return null;
    });
    renderAssistant();
    askQuestion('¿Cuánto dura la garantía de un portátil?');

    await screen.findByText('Los portátiles tienen 2 años de garantía [1].');
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      url: '/api/advisor/support',
      body: { question: '¿Cuánto dura la garantía de un portátil?', locale: 'es' },
    });
    expect(calls[0]?.body).not.toHaveProperty('orderId');
  });

  it('forwards a trimmed orderId for order-scoped questions', async () => {
    const calls = mockFetch((url) => {
      if (url === '/api/advisor/support') return jsonResponse(200, citedAnswer());
      return null;
    });
    renderAssistant();
    askQuestion('¿Cuál es el estado de mi pedido?', '  99999999-9999-4999-8999-999999999999  ');

    await screen.findByText('Los portátiles tienen 2 años de garantía [1].');
    expect(calls[0]?.body).toMatchObject({ orderId: '99999999-9999-4999-8999-999999999999' });
  });

  it('shows the abstention distinctly when the backend derives to a human', async () => {
    mockFetch((url) => {
      if (url === '/api/advisor/support')
        return jsonResponse(200, {
          answer: 'No tengo esa información, te derivo con el equipo humano.',
          citations: [],
          abstained: true,
        });
      return null;
    });
    renderAssistant();
    askQuestion('¿Cubrís daños por meteoritos?');

    await screen.findByText(messages.abstentionBadge);
    await screen.findByText('No tengo esa información, te derivo con el equipo humano.');
  });

  it('maps a 404 to the order-not-found message for order-scoped questions', async () => {
    mockFetch((url) => {
      if (url === '/api/advisor/support')
        return jsonResponse(404, {
          statusCode: 404,
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      return null;
    });
    renderAssistant();
    askQuestion('¿Mi pedido?', '88888888-8888-4888-8888-888888888888');

    await screen.findByText(messages.orderNotFoundError);
  });

  it('maps rate limiting to a friendly message with retry', async () => {
    mockFetch((url) => {
      if (url === '/api/advisor/support')
        return jsonResponse(429, { statusCode: 429, code: 'TOO_MANY_REQUESTS', message: 'Slow' });
      return null;
    });
    renderAssistant();
    askQuestion('¿Garantía?');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(messages.rateLimitError);
    });
    expect(screen.getByRole('button', { name: messages.retry })).toBeVisible();
  });
});
