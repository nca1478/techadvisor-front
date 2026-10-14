import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryView } from '@/features/admin/containers/inventory-view';
import type { AdminProductList } from '@/lib/api/admin';
import { getDictionarySync } from '@/lib/i18n/index';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const messages = getDictionarySync('es');

const data = {
  data: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Asus ROG Maximus Z890',
      sku: 'ASUS-ROG-MAX-Z890',
      stock: 7,
      reserved: 1,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Seasonic Focus GX-850',
      sku: 'SEA-FOCUS-GX850',
      stock: 0,
      reserved: 0,
    },
  ],
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
} as unknown as AdminProductList;

function renderView(stock: 'out_of_stock' | 'low_stock' | 'reserved' | null = null) {
  return render(
    <InventoryView
      data={data}
      loadError={false}
      page={1}
      stock={stock}
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
        page={1}
        stock={null}
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
        page={2}
        stock="low_stock"
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

  it('still shows exact stock levels per product', () => {
    renderView(null);

    expect(screen.getByText('Asus ROG Maximus Z890')).toBeInTheDocument();
    // available = stock - reserved = 6 for the first row.
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('links each product name to its admin product detail page', () => {
    renderView(null);

    const link = screen.getByRole('link', { name: 'Asus ROG Maximus Z890' });
    expect(link.getAttribute('href')).toBe(
      '/es/admin/productos/11111111-1111-4111-8111-111111111111',
    );
  });
});
