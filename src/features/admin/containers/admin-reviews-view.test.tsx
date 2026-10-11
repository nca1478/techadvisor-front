import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminReviewsView } from '@/features/admin/containers/admin-reviews-view';
import type { AdminReviewList } from '@/lib/api/admin';
import { getDictionarySync } from '@/lib/i18n/index';

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const messages = getDictionarySync('es');

const data = {
  data: [
    {
      id: 'rev-pending',
      productId: 'prod-1',
      productName: 'Asus ROG Maximus Z890 Hero WiFi7',
      rating: 5,
      title: 'Excelente',
      body: 'Funciona muy bien.',
      verifiedPurchase: true,
      createdAt: '2026-10-10T10:00:00.000Z',
      status: 'PENDING',
      userId: 'user-1',
    },
    {
      id: 'rev-published',
      productId: 'prod-2',
      productName: 'Corsair RM750e 750W 80+ Gold',
      rating: 2,
      title: 'Regular',
      body: 'Esperaba más.',
      verifiedPurchase: true,
      createdAt: '2026-10-09T10:00:00.000Z',
      status: 'PUBLISHED',
      userId: 'user-2',
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
} as unknown as AdminReviewList;

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

function renderView() {
  return render(
    <AdminReviewsView
      data={data}
      loadError={false}
      query={{ status: '', page: 1 }}
      locale="es"
      messages={messages}
    />,
  );
}

describe('AdminReviewsView', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    pushMock.mockClear();
    refreshMock.mockClear();
    // jsdom has no <dialog> imperative API: mirror showModal()/close() on
    // the `open` attribute closely enough for visibility computation.
    window.HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    window.HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  });

  it('renders pending rows with publish/reject and published rows with reject only', () => {
    renderView();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Publicar' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Rechazar' })).toHaveLength(2);
  });

  it('publishes a pending review after confirmation', async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const rawBody = typeof init?.body === 'string' ? init.body : '{}';
        calls.push({ url, body: JSON.parse(rawBody) as unknown });
        return Promise.resolve(jsonResponse(200, { id: 'rev-pending', status: 'PUBLISHED' }));
      }),
    );
    renderView();
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(messages.admin.reviews.publishConfirm)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publicar' }));
    await waitFor(() => {
      expect(calls).toHaveLength(1);
    });
    expect(calls[0]?.url).toBe('/api/admin/reviews/rev-pending/status');
    expect(calls[0]?.body).toEqual({ status: 'PUBLISHED' });
    await screen.findByText(messages.admin.reviews.moderated);
    expect(refreshMock).toHaveBeenCalled();
  });

  it('renders row numbers and product names instead of product UUIDs', () => {
    renderView();
    expect(screen.getByText(messages.admin.reviews.tableNumber)).toBeInTheDocument();
    expect(screen.getByText('Asus ROG Maximus Z890 Hero WiFi7')).toBeInTheDocument();
    expect(screen.getByText('Corsair RM750e 750W 80+ Gold')).toBeInTheDocument();
    expect(screen.queryByText(/prod-1/)).not.toBeInTheDocument();
    // Row numbers for page 1 (limit 10): 1 and 2.
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('navigates on status filter change', () => {
    renderView();
    fireEvent.change(screen.getByLabelText(messages.admin.reviews.statusFilter), {
      target: { value: 'PENDING' },
    });
    expect(pushMock).toHaveBeenCalledWith('/es/admin/resenas?status=PENDING');
  });

  it('renders the empty state without rows', () => {
    render(
      <AdminReviewsView
        data={{ data: [], total: 0, page: 1, limit: 10 }}
        loadError={false}
        query={{ status: '', page: 1 }}
        locale="es"
        messages={messages}
      />,
    );
    expect(screen.getByText(messages.admin.reviews.empty)).toBeInTheDocument();
  });

  it('renders the filtered empty state with a clear-filters action', () => {
    render(
      <AdminReviewsView
        data={{ data: [], total: 0, page: 1, limit: 10 }}
        loadError={false}
        query={{ status: 'PENDING', page: 1 }}
        locale="es"
        messages={messages}
      />,
    );
    expect(screen.getByText(messages.admin.reviews.emptyFiltered)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: messages.catalog.clearFilters }));
    expect(pushMock).toHaveBeenCalledWith('/es/admin/resenas');
  });
});
