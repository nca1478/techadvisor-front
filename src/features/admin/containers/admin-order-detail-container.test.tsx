import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminOrderDetailContainer } from '@/features/admin/containers/admin-order-detail-container';
import type { AdminOrder } from '@/lib/api/admin';
import { getDictionarySync } from '@/lib/i18n/index';

const messages = getDictionarySync('es');

function orderWith(overrides: Record<string, unknown> = {}): AdminOrder {
  return {
    id: '6c9eaef6-0000-4000-8000-000000000000',
    userId: 'cd5b8c19-ee08-4de2-a2f4-e417c68eca8e',
    userName: 'Ada Lovelace',
    userEmail: 'ada@example.com',
    status: 'PAID',
    currency: 'USD',
    totalAmount: 213400,
    items: [
      {
        productId: 'prod-1',
        name: 'Samsung 990 PRO 1TB NVMe (7450MB/s)',
        slug: 'samsung-990-pro-1tb',
        qty: 1,
        unitPriceAmount: 10900,
        lineTotalAmount: 10900,
      },
    ],
    shipping: {
      fullName: 'Nelson Cadenas',
      line1: 'Carrera 5 con calle 7 Casa Numero 7-13, Sector el Cementerio',
      city: 'San Juan de Colón',
      region: 'Táchira',
      postalCode: '5003',
      country: 'VE',
    },
    createdAt: '2026-10-12T19:29:00.000Z',
    updatedAt: '2026-10-12T19:29:00.000Z',
    ...overrides,
  };
}

describe('AdminOrderDetailContainer customer card', () => {
  it('shows the buyer name and email instead of the raw userId', () => {
    render(
      <AdminOrderDetailContainer initialOrder={orderWith()} locale="es" messages={messages} />,
    );

    expect(screen.getByText('Nombre')).toBeDefined();
    expect(screen.getByText('Ada Lovelace')).toBeDefined();
    expect(screen.getByText('Correo electrónico')).toBeDefined();
    expect(screen.getByText('ada@example.com')).toBeDefined();
    expect(screen.queryByText('cd5b8c19-ee08-4de2-a2f4-e417c68eca8e')).toBeNull();
  });

  it('falls back to the userId when the API response lacks buyer fields', () => {
    const stale = orderWith() as unknown as Record<string, unknown>;
    delete stale['userName'];
    delete stale['userEmail'];
    render(
      <AdminOrderDetailContainer
        initialOrder={stale as unknown as AdminOrder}
        locale="es"
        messages={messages}
      />,
    );

    expect(screen.getByText('cd5b8c19-ee08-4de2-a2f4-e417c68eca8e')).toBeDefined();
  });

  it('shows the shipping address with field labels', () => {
    render(
      <AdminOrderDetailContainer initialOrder={orderWith()} locale="es" messages={messages} />,
    );

    expect(screen.getByText('Dirección de envío')).toBeDefined();
    // Labels share a fixed column so every value starts at the same x.
    const nameLabel = screen.getByText('Nombre:');
    expect(nameLabel.parentElement?.className).toContain('grid-cols-[max-content_1fr]');
    expect(nameLabel.className).toContain('font-bold');
    expect(screen.getByText('Nelson Cadenas')).toBeDefined();
    expect(screen.getByText('Dirección:')).toBeDefined();
    expect(
      screen.getByText('Carrera 5 con calle 7 Casa Numero 7-13, Sector el Cementerio'),
    ).toBeDefined();
    expect(screen.getByText('San Juan de Colón · Táchira · 5003 · VE')).toBeDefined();
    expect(screen.queryByText(/Teléfono/)).toBeNull();
  });

  it('hides the shipping section when the API response lacks it', () => {
    const stale = orderWith({ shipping: undefined }) as unknown as Record<string, unknown>;
    delete stale['shipping'];
    render(
      <AdminOrderDetailContainer
        initialOrder={stale as unknown as AdminOrder}
        locale="es"
        messages={messages}
      />,
    );

    expect(screen.queryByText('Dirección de envío')).toBeNull();
  });

  it('links each item name to its admin product detail page', () => {
    render(
      <AdminOrderDetailContainer initialOrder={orderWith()} locale="es" messages={messages} />,
    );

    const link = screen.getByRole('link', { name: 'Samsung 990 PRO 1TB NVMe (7450MB/s)' });
    expect(link.getAttribute('href')).toBe('/es/admin/productos/prod-1');
  });
});
