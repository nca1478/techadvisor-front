import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Order } from '@/lib/api/orders';
import { getDictionarySync } from '@/lib/i18n/index';
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

  it('hides the page controls when everything fits on a single page', () => {
    render(
      <AccountOrdersView
        orders={elevenOrders.slice(0, 1)}
        loadError={false}
        locale="es"
        messages={messages}
      />,
    );
    expect(rows()).toBe(1);
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull();
  });
});
