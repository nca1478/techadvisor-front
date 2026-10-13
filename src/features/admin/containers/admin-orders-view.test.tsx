import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminOrdersView } from '@/features/admin/containers/admin-orders-view';
import type { AdminOrderList } from '@/lib/api/admin';
import { getDictionarySync } from '@/lib/i18n/index';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const messages = getDictionarySync('es');

function makeOrder(index: number) {
  const suffix = String(index);
  return {
    id: `6c9eaef${suffix}-0000-4000-8000-000000000000`,
    userId: `cd5b8c19-ee08-4de2-a2f4-e417c68eca8${suffix}`,
    userName: `Cliente ${suffix}`,
    userEmail: `cliente${suffix}@example.com`,
    status: 'PAID',
    currency: 'USD',
    totalAmount: 45000,
    items: [
      {
        productId: 'prod-1',
        name: 'Samsung 990 PRO 1TB NVMe (7450MB/s)',
        slug: 'samsung-990-pro-1tb',
        qty: 1,
        unitPriceAmount: 45000,
        lineTotalAmount: 45000,
      },
    ],
    shipping: {
      fullName: 'Ada Lovelace',
      line1: 'Calle Mayor 1',
      city: 'Madrid',
      country: 'ES',
    },
    createdAt: '2026-10-12T19:29:00.000Z',
    updatedAt: '2026-10-12T19:29:00.000Z',
  };
}

const singlePage = {
  data: [makeOrder(0), makeOrder(1), makeOrder(2)],
  page: 1,
  limit: 10,
  total: 3,
  totalPages: 1,
} as unknown as AdminOrderList;

function renderView() {
  return render(
    <AdminOrdersView
      data={singlePage}
      loadError={false}
      query={{ status: '', page: 1 }}
      locale="es"
      messages={messages}
    />,
  );
}

describe('AdminOrdersView pagination', () => {
  it('shows disabled page controls below the table on a single page', () => {
    renderView();

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(screen.getByText('Página 1 de 1')).toBeDefined();
    expect(within(nav).getByRole('button', { name: 'Anterior' })).toHaveProperty('disabled', true);
    expect(within(nav).getByRole('button', { name: 'Siguiente' })).toHaveProperty('disabled', true);
  });

  it('shows the buyer name in the Cliente column', () => {
    renderView();

    const table = screen.getByRole('table');
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((header) => header.textContent);
    expect(headers).toContain('Cliente');
    expect(screen.getByText('Cliente 0')).toBeDefined();
    expect(screen.getByText('Cliente 2')).toBeDefined();
    expect(screen.queryByText('cd5b8c19…')).toBeNull();
  });

  it('numbers rows with a No column', () => {
    renderView();

    const table = screen.getByRole('table');
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((header) => header.textContent);
    expect(headers[0]).toBe('No');
    const rows = within(table).getAllByRole('row');
    expect(within(rows[1]).getAllByRole('cell')[0].textContent).toBe('1');
    expect(within(rows[3]).getAllByRole('cell')[0].textContent).toBe('3');
  });

  it('falls back to the user id when the buyer name is missing', () => {
    const withoutName = {
      ...singlePage,
      data: [{ ...makeOrder(0), userName: null }],
    } as unknown as AdminOrderList;
    render(
      <AdminOrdersView
        data={withoutName}
        loadError={false}
        query={{ status: '', page: 1 }}
        locale="es"
        messages={messages}
      />,
    );

    expect(screen.getByText('cd5b8c19…')).toBeDefined();
  });
});
