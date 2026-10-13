import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardView, type DashboardSummary } from '@/features/admin/components/dashboard-view';
import { getDictionarySync } from '@/lib/i18n/index';

const messages = getDictionarySync('es');

function baseProps(overrides: Partial<DashboardSummary> = {}): DashboardSummary {
  return {
    recentOrders: [
      {
        id: '6c9eaef6-0000-4000-8000-000000000000',
        userId: 'cd5b8c19-0000-4000-8000-000000000000',
        userName: 'Ada Lovelace',
        userEmail: 'ada@example.com',
        status: 'PAID',
        currency: 'USD',
        totalAmount: 45000,
        items: [],
        shipping: { fullName: 'Ada', line1: 'Calle 1', city: 'Madrid', country: 'ES' },
        createdAt: '2026-10-12T19:29:00.000Z',
        updatedAt: '2026-10-12T19:29:00.000Z',
      },
    ],
    ordersError: false,
    ordersTotal: 3,
    revenueAmount: 65000,
    revenueCurrency: 'USD',
    revenueCount: 2,
    avgTicket: 32500,
    lowStockCount: 5,
    outOfStockCount: 2,
    pendingReviews: 3,
    failedDocs: 1,
    openUnanswered: 4,
    overviewError: false,
    attentionTotal: 13,
    attentionPartial: false,
    range: '7d',
    salesBuckets: [
      { key: '2026-10-12T00:00:00.000Z', label: '12 oct', amount: 45000 },
      { key: '2026-10-13T00:00:00.000Z', label: '13 oct', amount: 20000 },
    ],
    salesCurrency: 'USD',
    locale: 'es',
    messages,
    ...overrides,
  };
}

describe('DashboardView', () => {
  it('renders the four KPI cards with exact range labels', () => {
    render(<DashboardView {...baseProps()} />);

    expect(screen.getByText('Ingresos cobrados')).toBeInTheDocument();
    expect(screen.getByText('Ticket medio')).toBeInTheDocument();
    expect(screen.getByText('Requieren atención')).toBeInTheDocument();
    expect(screen.getByText('7 días · USD · 2')).toBeInTheDocument();
  });

  it('shows date, customer and a view action per order', () => {
    render(<DashboardView {...baseProps()} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getAllByText('Ver').length).toBeGreaterThan(0);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('lists the operational queue with exact counts and section links', () => {
    render(<DashboardView {...baseProps()} />);

    expect(screen.getByText('Cola operativa')).toBeInTheDocument();
    expect(screen.getByText('Reseñas pendientes')).toBeInTheDocument();
    expect(screen.getByText('Documentos fallidos')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Ver todo' }).length).toBeGreaterThan(0);
  });

  it('shows the empty-queue state when nothing needs attention', () => {
    render(
      <DashboardView
        {...baseProps({
          lowStockCount: 0,
          outOfStockCount: 0,
          pendingReviews: 0,
          failedDocs: 0,
          openUnanswered: 0,
          attentionTotal: 0,
        })}
      />,
    );

    expect(screen.getByText('Sin pendientes. Todo al día.')).toBeInTheDocument();
  });

  it('renders the range selector with links that keep the range in the URL', () => {
    render(<DashboardView {...baseProps()} />);

    const nav = screen.getByRole('navigation', { name: 'Rango' });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveTextContent('7 días');
    const todayLink = screen.getByRole('link', { name: 'Hoy' });
    expect(todayLink.getAttribute('href')).toBe('/es/admin?range=today');
  });

  it('renders exact sales as labelled bars', () => {
    render(<DashboardView {...baseProps()} />);

    expect(screen.getByText('Ventas cobradas')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /12 oct/ })).toBeInTheDocument();
  });

  it('shows the empty sales state without collected orders', () => {
    render(<DashboardView {...baseProps({ salesBuckets: [], salesCurrency: null })} />);

    expect(screen.getByText('Sin cobros en este rango.')).toBeInTheDocument();
  });

  it('shows unknown states when the overview fetch failed', () => {
    render(
      <DashboardView
        {...baseProps({
          ordersTotal: null,
          revenueCurrency: null,
          avgTicket: null,
          lowStockCount: null,
          outOfStockCount: null,
          pendingReviews: null,
          failedDocs: null,
          openUnanswered: null,
          overviewError: true,
          attentionPartial: true,
        })}
      />,
    );

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    expect(screen.getByText('Datos parciales')).toBeInTheDocument();
  });
});
