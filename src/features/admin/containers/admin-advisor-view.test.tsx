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
const query: AdminAdvisorQuery = { status: 'NEW', gpage: 1, fvalue: '', fpage: 1, tab: 'feedback' };

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
      statuses: ['NEW'],
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
    // jsdom has no <dialog> imperative API: mirror showModal()/close() on
    // the `open` attribute closely enough for visibility computation.
    window.HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    window.HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  });

  it('renders metrics, frequency groups and minimized feedback', () => {
    renderView();
    // Default tab (page 1) is feedback; groups live in the second tab.
    expect(screen.getByText('¿Cuánto dura…?')).toBeInTheDocument();
    expect(screen.queryByText('¿Cuánto dura la batería?')).not.toBeInTheDocument();
    expect(screen.getAllByText('No útil').length).toBeGreaterThan(0);
    // Satisfaction rate renders as a localized percent.
    expect(screen.getByText(/Satisfacción/)).toBeInTheDocument();
    // Feedback pagination stays visible even with a single page.
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    // Create-document shortcut carries the question as the title (groups tab).
    fireEvent.click(screen.getByRole('tab', { name: 'Preguntas sin respuesta por frecuencia' }));
    const docLink = screen.getAllByRole('link', { name: 'Crear documento' })[0];
    expect(docLink).toHaveAttribute(
      'href',
      `/es/admin/documentos/nuevo?title=${encodeURIComponent('¿Cuánto dura la batería?')}`,
    );
  });

  it('shows groups in the second tab with always-visible pagination', () => {
    renderView();
    fireEvent.click(screen.getByRole('tab', { name: 'Preguntas sin respuesta por frecuencia' }));
    expect(screen.getByText('¿Cuánto dura la batería?')).toBeInTheDocument();
    // Pagination controls stay visible at the end of the table (single page).
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('tab', { name: 'Preguntas sin respuesta por frecuencia' }));
    fireEvent.click(screen.getByRole('button', { name: 'Resolver' }));
    await waitFor(() => {
      expect(calls).toHaveLength(2);
    });
    expect(calls[0]?.url).toBe('/api/admin/advisor/unanswered/id-a');
    expect(calls[0]?.body).toEqual({ status: 'RESOLVED' });
    expect(calls[1]?.url).toBe('/api/admin/advisor/unanswered/id-b');
    await screen.findByText('Actualizado.');
  });

  it('hides triage actions on fully resolved buckets (no backward moves)', () => {
    render(
      <AdminAdvisorView
        metrics={metrics}
        metricsError={false}
        groups={{
          ...groups,
          data: [
            {
              key: 'celulares',
              sample: 'celulares',
              count: 1,
              latestAt: '2026-10-16T14:58:00.000Z',
              ids: ['id-resolved'],
              statuses: ['RESOLVED'],
            },
          ],
        }}
        groupsError={false}
        feedback={feedback}
        feedbackError={false}
        query={{ status: '', gpage: 1, fvalue: '', fpage: 1, tab: 'groups' }}
        locale="es"
        messages={messages}
      />,
    );
    expect(screen.getByText('celulares')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revisar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resolver' })).not.toBeInTheDocument();
    expect(screen.getAllByText('Resuelta').length).toBeGreaterThanOrEqual(2);
  });

  it('skips backward-move conflicts on mixed buckets instead of erroring', async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const rawBody = typeof init?.body === 'string' ? init.body : '{}';
        calls.push({ url, body: JSON.parse(rawBody) as unknown });
        if (url.endsWith('/id-resolved')) {
          return Promise.resolve(
            jsonResponse(400, {
              statusCode: 400,
              code: 'BAD_REQUEST',
              message:
                'Cannot move unanswered query from RESOLVED to IN_REVIEW: triage only moves forward (NEW → IN_REVIEW → RESOLVED)',
            }),
          );
        }
        return Promise.resolve(jsonResponse(200, { id: 'x', status: 'IN_REVIEW' }));
      }),
    );
    render(
      <AdminAdvisorView
        metrics={metrics}
        metricsError={false}
        groups={{
          ...groups,
          data: [
            {
              key: 'mixto',
              sample: 'mixto',
              count: 2,
              latestAt: '2026-10-16T14:58:00.000Z',
              ids: ['id-new', 'id-resolved'],
              statuses: ['NEW', 'RESOLVED'],
            },
          ],
        }}
        groupsError={false}
        feedback={feedback}
        feedbackError={false}
        query={{ status: '', gpage: 1, fvalue: '', fpage: 1, tab: 'groups' }}
        locale="es"
        messages={messages}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Revisar' }));
    await screen.findByText('Actualizado.');
    expect(calls).toHaveLength(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
    // Metrics error + active (feedback) tab error; groups error appears in its tab.
    expect(screen.getAllByText('No se pudo cargar.')).toHaveLength(2);
    fireEvent.click(screen.getByRole('tab', { name: 'Preguntas sin respuesta por frecuencia' }));
    expect(screen.getAllByText('No se pudo cargar.')).toHaveLength(2);
  });
});
