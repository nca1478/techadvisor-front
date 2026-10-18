import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '@/features/cart/cart-context';
import { CartPageContainer } from './cart-page-container';
import { getDictionarySync } from '@/lib/i18n/index';

const messages = getDictionarySync('es').cart;

function cartPayload() {
  return {
    id: 'cart-1',
    currency: 'USD',
    locale: 'es',
    items: [
      {
        productId: 'ram-id',
        name: 'Mock RAM DDR4',
        slug: 'mock-ram-ddr4',
        imageUrl: null,
        unitPriceAmount: 4900,
        qty: 1,
        lineTotalAmount: 4900,
        inStock: true,
        sufficientStock: true,
        availableQuantity: 5,
      },
      {
        productId: 'board-id',
        name: 'Mock Board DDR5',
        slug: 'mock-board-ddr5',
        imageUrl: null,
        unitPriceAmount: 18900,
        qty: 1,
        lineTotalAmount: 18900,
        inStock: true,
        sufficientStock: true,
        availableQuantity: 5,
      },
    ],
    totalAmount: 23800,
    itemCount: 2,
  };
}

function incompatibilityPayload() {
  return {
    compatible: false,
    issues: [
      {
        rule: 'ram-type',
        severity: 'error',
        productIds: ['ram-id', 'board-id'],
        messageKey: 'ram-type.mismatch',
        message: 'La memoria "Mock RAM DDR4" es DDR4, pero la placa solo acepta DDR5.',
      },
    ],
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function stubFetch(compatibilityBody: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: unknown, init?: RequestInit) => {
      if (String(url) === '/api/cart') return Promise.resolve(jsonResponse(200, cartPayload()));
      if (String(url) === '/api/compatibility/check') {
        // Expose the request body for qty assertions (see test below).
        (globalThis as { __compatBody?: unknown }).__compatBody = JSON.parse(init?.body as string);
        return Promise.resolve(jsonResponse(200, compatibilityBody));
      }
      return Promise.resolve(jsonResponse(500, { message: 'unmocked' }));
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderCart() {
  render(
    <CartProvider>
      <CartPageContainer locale="es" messages={messages} />
    </CartProvider>,
  );
}

describe('CartPageContainer compatibility', () => {
  it('shows the deterministic error with links and gates checkout behind acknowledgement', async () => {
    stubFetch(incompatibilityPayload());
    renderCart();

    await screen.findByText(/es DDR4, pero la placa solo acepta DDR5/);
    expect(screen.getByRole('link', { name: 'Ver producto: Mock RAM DDR4' })).toHaveAttribute(
      'href',
      '/es/productos/mock-ram-ddr4',
    );

    // Errors never block the purchase, but checkout requires explicit opt-in.
    const checkout = screen.getByRole('button', { name: messages.summary.checkout });
    expect(checkout).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => {
      expect(screen.getByRole('link', { name: messages.summary.checkout })).toHaveAttribute(
        'href',
        '/es/checkout',
      );
    });
  });

  it('renders compatibility below the items and the summary', async () => {
    stubFetch(incompatibilityPayload());
    renderCart();

    const alert = await screen.findByText(/es DDR4, pero la placa solo acepta DDR5/);
    const checkout = screen.getByRole('button', { name: messages.summary.checkout });
    expect(alert.compareDocumentPosition(checkout) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  it('checks out directly when the build is compatible', async () => {
    stubFetch({ compatible: true, issues: [] });
    renderCart();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: messages.summary.checkout })).toHaveAttribute(
        'href',
        '/es/checkout',
      );
    });
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('sends cart quantities to the compatibility check', async () => {
    stubFetch({ compatible: true, issues: [] });
    renderCart();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: messages.summary.checkout })).toHaveAttribute(
        'href',
        '/es/checkout',
      );
    });
    const body = (globalThis as { __compatBody?: unknown }).__compatBody as {
      items?: { productId: string; qty: number }[];
    };
    expect(body.items).toEqual(
      expect.arrayContaining([
        { productId: 'ram-id', qty: 1 },
        { productId: 'board-id', qty: 1 },
      ]),
    );
  });
});
