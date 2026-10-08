import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '@/features/cart/cart-context';
import { CartNavLink } from './cart-nav-link';

const messages = { label: 'Carrito', withCount: 'Carrito, {count} artículos' };

function cartResponse(itemCount: number) {
  return {
    id: 'cart-1',
    currency: 'USD',
    locale: 'es',
    items: [],
    totalAmount: 0,
    itemCount,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderLink(itemCount: number | null) {
  if (itemCount === null) {
    vi.stubGlobal(
      'fetch',
      vi.fn((): Promise<Response> => Promise.reject(new Error('offline'))),
    );
  } else {
    vi.stubGlobal(
      'fetch',
      vi.fn((): Promise<Response> =>
        Promise.resolve(new Response(JSON.stringify(cartResponse(itemCount)), { status: 200 })),
      ),
    );
  }
  render(
    <CartProvider>
      <CartNavLink locale="es" messages={messages} />
    </CartProvider>,
  );
}

describe('CartNavLink', () => {
  it('shows the item count badge once the cart loads', async () => {
    renderLink(3);
    expect(await screen.findByText('3')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Carrito, 3 artículos' })).toHaveAttribute(
      'href',
      '/es/carrito',
    );
  });

  it('renders the plain link without a badge while loading', () => {
    renderLink(0);
    expect(screen.getByRole('link', { name: 'Carrito' })).toHaveAttribute('href', '/es/carrito');
  });
});
