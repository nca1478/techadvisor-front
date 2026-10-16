import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Order } from '@/lib/api/orders';
import { getDictionarySync } from '@/lib/i18n/index';
import { OrderDetail } from './components/orders-table';
import { OrderTimeline } from './components/order-timeline';
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
    statusHistory: [],
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

describe('OrderTimeline', () => {
  it('marks the current step with aria-current and keeps later steps muted', () => {
    render(<OrderTimeline status="PROCESSING" messages={messages} locale="es" />);
    const list = screen.getByRole('list', { name: 'Progreso del pedido' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(items[2]).toHaveAttribute('aria-current', 'step');
    expect(items[2].textContent).toContain('En preparación');
    expect(items[0].textContent).toContain('✓');
    expect(items[4].textContent).toContain('Entregado');
  });

  it('renders every verified state label in the linear flow', () => {
    render(<OrderTimeline status="PAID" messages={messages} locale="es" />);
    for (const label of ['Pago pendiente', 'Pagado', 'En preparación', 'Enviado', 'Entregado']) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  it('renders a terminal cancelled node without extra copy', () => {
    render(<OrderTimeline status="CANCELLED" messages={messages} locale="es" />);
    const list = screen.getByRole('list', { name: 'Progreso del pedido' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(6);
    expect(screen.getByText('Cancelado')).toBeDefined();
    expect(screen.queryByText(/ya no avanzará/)).toBeNull();
    // The "Entregado" step keeps its trailing connector in cancelled mode,
    // rendered by the same code as every other line so it aligns with them.
    const delivered = items[4];
    expect(delivered.textContent).toContain('Entregado');
    const hidden = delivered.querySelectorAll('[aria-hidden="true"]');
    const separator = Array.from(hidden).find((el) => el.className.includes('w-8'));
    expect(separator).toBeDefined();
    expect(separator?.className).toContain('bg-border-strong');
  });

  it('shows the timeline title inside the customer order detail', () => {
    const order = { ...makeOrder(0), status: 'SHIPPED' as const, items: [] };
    render(<OrderDetail order={order} locale="es" messages={messages} />);
    expect(screen.getByText('Estado del pedido')).toBeDefined();
    expect(screen.getByRole('list', { name: 'Progreso del pedido' })).toBeDefined();
  });

  it('shows the recorded date/time under each reached step', () => {
    render(
      <OrderTimeline
        status="SHIPPED"
        messages={messages}
        locale="es"
        history={[
          { from: null, to: 'PENDING_PAYMENT', at: '2026-10-14T10:45:00.000Z' },
          { from: 'PENDING_PAYMENT', to: 'PAID', at: '2026-10-14T11:02:00.000Z' },
          { from: 'PAID', to: 'PROCESSING', at: '2026-10-14T12:00:00.000Z' },
          { from: 'PROCESSING', to: 'SHIPPED', at: '2026-10-15T09:30:00.000Z' },
        ]}
      />,
    );
    const times = screen.getAllByText(/oct 2026/i);
    expect(times).toHaveLength(4);
    for (const time of times) {
      expect(time.tagName).toBe('TIME');
      expect(time.getAttribute('datetime')).toMatch(/2026-10-1[45]/);
    }
  });

  it('falls back to creation/update dates for pre-history orders', () => {
    render(
      <OrderTimeline
        status="PAID"
        messages={messages}
        locale="es"
        history={[]}
        fallbackAt={(step) => {
          if (step === 'PENDING_PAYMENT') return '2026-10-08T04:12:00.000Z';
          if (step === 'PAID') return '2026-10-09T06:00:00.000Z';
          return null;
        }}
      />,
    );
    expect(screen.getAllByText(/oct 2026/i)).toHaveLength(2);
  });

  it('dates the terminal cancelled node from history', () => {
    render(
      <OrderTimeline
        status="CANCELLED"
        messages={messages}
        locale="es"
        history={[
          { from: null, to: 'PENDING_PAYMENT', at: '2026-10-14T10:45:00.000Z' },
          { from: 'PENDING_PAYMENT', to: 'CANCELLED', at: '2026-10-14T10:50:00.000Z' },
        ]}
      />,
    );
    const list = screen.getByRole('list', { name: 'Progreso del pedido' });
    const cancelled = within(list).getAllByRole('listitem')[5];
    expect(cancelled.textContent).toContain('Cancelado');
    expect(within(cancelled).getByText(/oct 2026/i).tagName).toBe('TIME');
  });

  it('shows recorded step dates inside the customer order detail', () => {
    const order = {
      ...makeOrder(0),
      status: 'SHIPPED' as const,
      items: [],
      createdAt: '2026-10-08T04:12:00.000Z',
      updatedAt: '2026-10-15T09:30:00.000Z',
      statusHistory: [{ from: 'PROCESSING', to: 'SHIPPED', at: '2026-10-15T09:30:00.000Z' }],
    };
    render(<OrderDetail order={order} locale="es" messages={messages} />);
    expect(screen.getByRole('list', { name: 'Progreso del pedido' })).toBeDefined();
    expect(screen.getAllByText(/15 oct 2026/i).length).toBeGreaterThan(0);
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
