import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdminAdvisorView,
  type AdminAdvisorQuery,
} from '@/features/admin/containers/admin-advisor-view';
import type {
  AdminAdvisorFeedbackList,
  AdminAdvisorMetrics,
  AdminUnansweredGroupList,
} from '@/lib/api/admin';
import es from '@/messages/es.json';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const messages = es;
const query: AdminAdvisorQuery = { status: 'NEW', gpage: 1, fvalue: '', fpage: 1 };

const metrics: AdminAdvisorMetrics = {
  openUnanswered: 3,
  unansweredByStatus: [{ key: 'NEW', count: 3 }],
  unansweredByReason: [{ key: 'no_evidence', count: 3 }],
  feedbackTotal: 3,
  feedbackUp: 2,
  feedbackDown: 1,
  satisfactionRate: 2 / 3,
  topQueries: [{ key: 'cuanto dura la bateria', sample: '¿Cuánto dura la batería?', count: 2 }],
};

const groups: AdminUnansweredGroupList = {
  data: [
    {
      key: 'cuanto dura la bateria',
      sample: '¿Cuánto dura la batería?',
      count: 2,
      latestAt: '2026-10-10T10:00:00.000Z',
      ids: ['id-a', 'id-b'],
    },
  ],
  page: 1,
  limit: 10,
  total: 1,
  totalPages: 1,
};

const feedback = {
  data: [
    {
      id: 'fb-1',
      productId: null,
      sessionId: 'session-1',
      value: 'down',
      abstained: false,
      queryExcerpt: '¿Cuánto dura…?',
      answerExcerpt: 'La batería dura…',
      queryLength: 24,
      answerLength: 40,
      createdAt: '2026-10-10T10:00:00.000Z',
    },
  ],
  page: 1,
  limit: 10,
  total: 1,
  totalPages: 1,
} as unknown as AdminAdvisorFeedbackList;

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

function renderView() {
  return render(
    <AdminAdvisorView
      metrics={metrics}
      metricsError={false}
      groups={groups}
      groupsError={false}
      feedback={feedback}
      feedbackError={false}
      query={query}
      locale="es"
      messages={messages}
    />,
  );
}

describe('AdminAdvisorView', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders metrics, frequency groups and minimized feedback', () => {
    renderView();
    expect(screen.getByText('¿Cuánto dura la batería?')).toBeInTheDocument();
    expect(screen.getByText('¿Cuánto dura…?')).toBeInTheDocument();
    expect(screen.getAllByText('No útil').length).toBeGreaterThan(0);
    // Satisfaction rate renders as a localized percent.
    expect(screen.getByText(/Satisfacción/)).toBeInTheDocument();
    // Create-document shortcut carries the question as the title.
    const docLink = screen.getAllByRole('link', { name: 'Crear documento' })[0];
    expect(docLink).toHaveAttribute(
      'href',
      `/es/admin/documentos?title=${encodeURIComponent('¿Cuánto dura la batería?')}`,
    );
  });

  it('resolves a whole bucket with one action (forward-only triage)', async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const rawBody = typeof init?.body === 'string' ? init.body : '{}';
        calls.push({ url, body: JSON.parse(rawBody) as unknown });
        return Promise.resolve(jsonResponse(200, { id: 'x', status: 'RESOLVED' }));
      }),
    );
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Resolver' }));
    await waitFor(() => {
      expect(calls).toHaveLength(2);
    });
    expect(calls[0]?.url).toBe('/api/admin/advisor/unanswered/id-a');
    expect(calls[0]?.body).toEqual({ status: 'RESOLVED' });
    expect(calls[1]?.url).toBe('/api/admin/advisor/unanswered/id-b');
    await screen.findByText('Actualizado.');
  });

  it('expands feedback detail and loads the minimized conversation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url === '/api/admin/advisor/feedback/fb-1') {
          return Promise.resolve(
            jsonResponse(200, {
              id: 'fb-1',
              query: '¿Cuánto dura la batería?',
              answer: 'La batería dura 10 horas.',
            }),
          );
        }
        if (url === '/api/admin/advisor/sessions/session-1') {
          return Promise.resolve(
            jsonResponse(200, {
              sessionId: 'session-1',
              messageCount: 1,
              messages: [{ role: 'USER', excerpt: 'hola', length: 4 }],
              createdAt: '2026-10-10T09:00:00.000Z',
            }),
          );
        }
        return Promise.resolve(jsonResponse(404, { message: 'not found' }));
      }),
    );
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));
    await screen.findByText(/La batería dura 10 horas\./);
    fireEvent.click(screen.getByRole('button', { name: 'Conversación' }));
    await screen.findByText(/Conversación \(extractos\)/);
    expect(screen.getAllByText(/nunca se expone aquí/).length).toBeGreaterThan(0);
  });

  it('renders load errors without rows', () => {
    render(
      <AdminAdvisorView
        metrics={null}
        metricsError
        groups={null}
        groupsError
        feedback={null}
        feedbackError
        query={query}
        locale="es"
        messages={messages}
      />,
    );
    expect(screen.getAllByText('No se pudo cargar.')).toHaveLength(3);
  });
});
