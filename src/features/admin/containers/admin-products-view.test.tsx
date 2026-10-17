import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdminProductsView,
  type AdminProductsQuery,
} from '@/features/admin/containers/admin-products-view';
import type { AdminCategory, AdminProductList, AdminProductMetrics } from '@/lib/api/admin';
import { getDictionarySync } from '@/lib/i18n/index';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}));

const messages = getDictionarySync('es');

const categoriesFixture = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'Placas base',
    slug: 'placas-base',
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    name: 'Fuentes',
    slug: 'fuentes',
  },
] as unknown as AdminCategory[];

const data = {
  data: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Asus ROG Maximus Z890',
      sku: 'ASUS-ROG-MAX-Z890',
      status: 'ACTIVE',
      priceAmount: 129900,
      currency: 'USD',
      stock: 7,
      reserved: 1,
    },
  ],
  page: 1,
  limit: 10,
  total: 1,
  totalPages: 1,
} as unknown as AdminProductList;

const metricsFixture: AdminProductMetrics = {
  total: 1,
  active: 1,
  lowStock: 0,
  outOfStock: 0,
  inStock: 1,
  reserved: 1,
  lowStockThreshold: 5,
};

const baseQuery: AdminProductsQuery = { status: '', category: '', q: '', page: 1 };

function renderView(query: AdminProductsQuery = baseQuery) {
  return render(
    <AdminProductsView
      data={data}
      loadError={false}
      metrics={metricsFixture}
      metricsError={false}
      query={query}
      categories={categoriesFixture}
      locale="es"
      messages={messages}
    />,
  );
}

describe('AdminProductsView category filter', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders the category filter with the current value selected', () => {
    renderView({ ...baseQuery, category: 'fuentes' });

    const select = screen.getByLabelText(messages.admin.products.categoryFilter);
    expect(select).toHaveValue('fuentes');
    expect(
      screen.getByRole('option', { name: messages.admin.products.allCategories }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Placas base' })).toBeInTheDocument();
  });

  it('navigates with the new category on page 1 when the filter changes', () => {
    renderView();

    fireEvent.change(screen.getByLabelText(messages.admin.products.categoryFilter), {
      target: { value: 'placas-base' },
    });
    expect(pushMock).toHaveBeenCalledWith('/es/admin/productos?category=placas-base&page=1', {
      scroll: false,
    });
  });

  it('keeps the category when the status filter changes', () => {
    renderView({ ...baseQuery, category: 'placas-base' });

    fireEvent.change(screen.getByLabelText(messages.admin.products.statusFilter), {
      target: { value: 'ACTIVE' },
    });
    expect(pushMock).toHaveBeenCalledWith(
      '/es/admin/productos?status=ACTIVE&category=placas-base&page=1',
      { scroll: false },
    );
  });

  it('clears the category filter with the clear button', () => {
    renderView({ ...baseQuery, category: 'fuentes' });

    fireEvent.click(screen.getByRole('button', { name: messages.catalog.clearFilters }));
    expect(pushMock).toHaveBeenCalledWith('/es/admin/productos?page=1', { scroll: false });
  });
});
