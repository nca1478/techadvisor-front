import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryView } from '@/features/admin/containers/inventory-view';
import type { AdminCategory, AdminProductList, AdminProductMetrics } from '@/lib/api/admin';
import { getDictionarySync } from '@/lib/i18n/index';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
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
      categoryId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      stock: 7,
      reserved: 1,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Seasonic Focus GX-850',
      sku: 'SEA-FOCUS-GX850',
      categoryId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      stock: 0,
      reserved: 0,
    },
  ],
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
} as unknown as AdminProductList;

const metricsFixture: AdminProductMetrics = {
  total: 2,
  active: 2,
  lowStock: 1,
  outOfStock: 1,
  inStock: 1,
  reserved: 1,
  lowStockThreshold: 5,
};

function renderView(
  stock: 'out_of_stock' | 'low_stock' | 'reserved' | null = null,
  q = '',
  category: string | null = null,
) {
  return render(
    <InventoryView
      data={data}
      loadError={false}
      metrics={metricsFixture}
      metricsError={false}
      page={1}
      stock={stock}
      category={category}
      categories={categoriesFixture}
      q={q}
      selectedProductId={null}
      locale="es"
      messages={messages}
      panel={null}
    />,
  );
}

describe('InventoryView stock filter', () => {
  beforeEach(() => {
    pushMock.mockClear();
    // jsdom has no <dialog> imperative API: mirror showModal()/close() on
    // the `open` attribute closely enough for visibility computation.
    window.HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    window.HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
  });

  it('renders the filter with the current value selected', () => {
    renderView('low_stock');

    const select = screen.getByLabelText(messages.admin.inventory.stockFilter);
    expect(select).toHaveValue('low_stock');
    expect(
      screen.getByRole('option', { name: messages.admin.inventory.allStock }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: messages.admin.inventory.stock_out_of_stock }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: messages.admin.inventory.stock_low_stock }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: messages.admin.inventory.stock_reserved }),
    ).toBeInTheDocument();
  });

  it('navigates with the new filter on page 1 when the filter changes', () => {
    renderView(null);

    fireEvent.change(screen.getByLabelText(messages.admin.inventory.stockFilter), {
      target: { value: 'out_of_stock' },
    });
    expect(pushMock).toHaveBeenCalledWith('/es/admin/inventario?page=1&stock=out_of_stock', {
      scroll: false,
    });
  });

  it('clears the selection when the filter changes', () => {
    render(
      <InventoryView
        data={data}
        loadError={false}
        metrics={metricsFixture}
        metricsError={false}
        page={1}
        stock={null}
        category={null}
        categories={categoriesFixture}
        q=""
        selectedProductId="11111111-1111-4111-8111-111111111111"
        locale="es"
        messages={messages}
        panel={null}
      />,
    );

    fireEvent.change(screen.getByLabelText(messages.admin.inventory.stockFilter), {
      target: { value: 'reserved' },
    });
    expect(pushMock).toHaveBeenCalledWith('/es/admin/inventario?page=1&stock=reserved', {
      scroll: false,
    });
  });

  it('resets the filter with the clear button', () => {
    renderView('reserved');

    fireEvent.click(screen.getByRole('button', { name: messages.catalog.clearFilters }));
    expect(pushMock).toHaveBeenCalledWith('/es/admin/inventario?page=1', { scroll: false });
  });

  it('keeps the filter when paginating or selecting a product', () => {
    render(
      <InventoryView
        data={{ ...data, page: 2, totalPages: 3 }}
        loadError={false}
        metrics={metricsFixture}
        metricsError={false}
        page={2}
        stock="low_stock"
        category={null}
        categories={categoriesFixture}
        q=""
        selectedProductId={null}
        locale="es"
        messages={messages}
        panel={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: messages.admin.next }));
    expect(pushMock).toHaveBeenCalledWith('/es/admin/inventario?page=3&stock=low_stock', {
      scroll: false,
    });

    fireEvent.click(screen.getAllByRole('button', { name: messages.admin.inventory.adjust })[0]);
    expect(pushMock).toHaveBeenCalledWith(
      '/es/admin/inventario?page=1&stock=low_stock&productId=11111111-1111-4111-8111-111111111111',
      { scroll: false },
    );
  });

  it('shows metric cards and exact stock levels without the available column', () => {
    renderView(null);

    expect(screen.getByText('Asus ROG Maximus Z890')).toBeInTheDocument();
    expect(screen.getByText(messages.admin.inventory.metricsTotal)).toBeInTheDocument();
    expect(screen.getByText(messages.admin.inventory.metricsReserved)).toBeInTheDocument();
    expect(screen.queryByText(messages.admin.inventory.tableAvailable)).not.toBeInTheDocument();
  });

  it('shows the adjust panel in a modal dialog and closes it clearing the selection', () => {
    render(
      <InventoryView
        data={data}
        loadError={false}
        metrics={metricsFixture}
        metricsError={false}
        page={1}
        stock={null}
        category={null}
        categories={categoriesFixture}
        q=""
        selectedProductId="11111111-1111-4111-8111-111111111111"
        locale="es"
        messages={messages}
        panel={<div>Ajuste demo</div>}
      />,
    );

    expect(document.querySelector('dialog')).not.toBeNull();
    expect(screen.getByText('Ajustar stock de Asus ROG Maximus Z890')).toBeInTheDocument();
    expect(screen.getByText('Ajuste demo')).toBeInTheDocument();
    // Single X close button (top-right) shares the close label.
    const closeButtons = screen.getAllByRole('button', { name: messages.admin.inventory.close });
    expect(closeButtons).toHaveLength(1);
    // Background page is scroll-locked while the modal is open.
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(closeButtons[0]);
    expect(pushMock).toHaveBeenCalledWith('/es/admin/inventario?page=1', { scroll: false });
  });

  it('closes the adjust modal when clicking the backdrop', () => {
    render(
      <InventoryView
        data={data}
        loadError={false}
        metrics={metricsFixture}
        metricsError={false}
        page={1}
        stock={null}
        category={null}
        categories={categoriesFixture}
        q=""
        selectedProductId="11111111-1111-4111-8111-111111111111"
        locale="es"
        messages={messages}
        panel={<div>Ajuste demo</div>}
      />,
    );

    const dialog = document.querySelector('dialog');
    expect(dialog).not.toBeNull();
    if (dialog) fireEvent.click(dialog);
    expect(pushMock).toHaveBeenCalledWith('/es/admin/inventario?page=1', { scroll: false });
  });

  it('links each product name to its admin product detail page', () => {
    renderView(null);

    const link = screen.getByRole('link', { name: 'Asus ROG Maximus Z890' });
    expect(link.getAttribute('href')).toBe(
      '/es/admin/productos/11111111-1111-4111-8111-111111111111',
    );
  });

  it('renders the category column with the resolved category name', () => {
    renderView(null);

    expect(
      screen.getByRole('columnheader', { name: messages.admin.inventory.tableCategory }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Placas base')).toHaveLength(2);
    expect(screen.getAllByText('Fuentes')).toHaveLength(2);
  });

  it('renders the category filter with the current value selected', () => {
    renderView(null, '', 'fuentes');

    const select = screen.getByLabelText(messages.admin.inventory.categoryFilter);
    expect(select).toHaveValue('fuentes');
    expect(
      screen.getByRole('option', { name: messages.admin.inventory.allCategories }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Placas base' })).toBeInTheDocument();
  });

  it('navigates with the new category on page 1 when the category filter changes', () => {
    renderView(null);

    fireEvent.change(screen.getByLabelText(messages.admin.inventory.categoryFilter), {
      target: { value: 'placas-base' },
    });
    expect(pushMock).toHaveBeenCalledWith('/es/admin/inventario?page=1&category=placas-base', {
      scroll: false,
    });
  });

  it('clears the category filter with the clear button', () => {
    renderView(null, '', 'fuentes');

    fireEvent.click(screen.getByRole('button', { name: messages.catalog.clearFilters }));
    expect(pushMock).toHaveBeenCalledWith('/es/admin/inventario?page=1', { scroll: false });
  });
});
