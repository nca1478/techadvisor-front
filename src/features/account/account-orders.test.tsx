import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Order } from '@/lib/api/orders';
import { getDictionarySync } from '@/lib/i18n/index';
import { OrderDetail } from './components/orders-table';
import { AccountOrdersView } from './containers/account-orders-view';

const messages = getDictionarySync('es').account;

function makeOrder(index: number): Order {
  return {
    id: `order-${String(index).padStart(2, '0')}-uuid`,
    status: 'PAID',
    currency: 'USD',
    totalAmount: 45000,
    itemCount: 1,
    shipping: { fullName: 'Ada Lovelace', line1: 'Calle Mayor 1', city: 'Madrid', country: 'ES' },
    items: [],
    createdAt: '2026-10-08T04:12:00.000Z',
    updatedAt: '2026-10-08T04:12:00.000Z',
  };
}

const elevenOrders = Array.from({ length: 11 }, (_, i) => makeOrder(i));

function rows() {
  return within(screen.getByRole('table')).getAllByRole('row').length - 1;
}

describe('AccountOrdersView pagination', () => {
  it('shows 10 orders per page with page controls at the end of the table', () => {
    render(
      <AccountOrdersView orders={elevenOrders} loadError={false} locale="es" messages={messages} />,
    );
    expect(rows()).toBe(10);
    expect(screen.getByText('Página 1 de 2')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDefined();
  });

  it('advances to the remaining orders on the second page', () => {
    render(
      <AccountOrdersView orders={elevenOrders} loadError={false} locale="es" messages={messages} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(rows()).toBe(1);
    expect(screen.getByText('Página 2 de 2')).toBeDefined();
  });

  it('shows disabled page controls below the table on a single page', () => {
    render(
      <AccountOrdersView
        orders={elevenOrders.slice(0, 1)}
        loadError={false}
        locale="es"
        messages={messages}
      />,
    );
    expect(rows()).toBe(1);
    expect(screen.getByText('Página 1 de 1')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Anterior' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Siguiente' })).toHaveProperty('disabled', true);
  });

  it('links the order id to the order detail', () => {
    render(
      <AccountOrdersView
        orders={elevenOrders.slice(0, 1)}
        loadError={false}
        locale="es"
        messages={messages}
      />,
    );
    const idLink = screen.getByRole('link', { name: 'order-00…' });
    expect(idLink.getAttribute('href')).toBe('/es/cuenta/ordenes/order-00-uuid');
  });

  it('numbers rows with a No column, continuous across pages', () => {
    render(
      <AccountOrdersView orders={elevenOrders} loadError={false} locale="es" messages={messages} />,
    );
    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'No' })).toBeDefined();
    const firstPageRows = within(table).getAllByRole('row');
    expect(within(firstPageRows[1]).getAllByRole('cell')[0].textContent).toBe('1');
    expect(within(firstPageRows[10]).getAllByRole('cell')[0].textContent).toBe('10');
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    const secondPageRows = within(screen.getByRole('table')).getAllByRole('row');
    expect(secondPageRows.length - 1).toBe(1);
    expect(within(secondPageRows[1]).getAllByRole('cell')[0].textContent).toBe('11');
  });
});

describe('OrderDetail product links', () => {
  it('links each item name to its product detail page', () => {
    const order = {
      ...makeOrder(0),
      items: [
        {
          productId: 'prod-1',
          name: 'External USB 2TB Toshiba 2.5" (3.0) Hard Drive',
          slug: 'external-usb-2tb-toshiba',
          qty: 1,
          unitPriceAmount: 22821,
          lineTotalAmount: 22821,
        },
      ],
    };
    render(<OrderDetail order={order} locale="es" messages={messages} />);
    const link = screen.getByRole('link', {
      name: 'External USB 2TB Toshiba 2.5" (3.0) Hard Drive',
    });
    expect(link.getAttribute('href')).toBe('/es/productos/external-usb-2tb-toshiba');
  });
});
