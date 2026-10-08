import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import en from '@/messages/en.json';
import { CartProvider } from '@/features/cart/cart-context';
import type { ProductListItem } from '@/lib/api/catalog';
import { ProductListView } from './product-list-view';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/en/productos',
  useSearchParams: () => new URLSearchParams(''),
}));

const emptyCart = {
  id: 'cart-1',
  currency: 'USD',
  locale: 'en',
  items: [],
  totalAmount: 0,
  itemCount: 0,
};

function product(): ProductListItem {
  return {
    id: 'id-1',
    sku: 'SKU-1',
    name: 'Test Laptop 15',
    slug: 'test-laptop-15',
    description: 'A test laptop.',
    brand: { id: 'b1', name: 'TestBrand', slug: 'testbrand' },
    category: {
      id: 'c1',
      name: 'Laptops',
      slug: 'laptops',
      parentSlug: null,
      specsSchema: [],
      locale: 'en',
    },
    priceAmount: 129900,
    currency: 'USD',
    specs: {},
    inStock: true,
    availableQuantity: 5,
    imageUrl: null,
    imageAlt: null,
    locale: 'en',
    createdAt: '2026-10-06T12:00:00.000Z',
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderView() {
  vi.stubGlobal(
    'fetch',
    vi.fn((): Promise<Response> =>
      Promise.resolve(new Response(JSON.stringify(emptyCart), { status: 200 })),
    ),
  );
  render(
    <CartProvider>
      <ProductListView
        initialData={{
          data: [product()],
          meta: { page: 1, limit: 12, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
        }}
        loadError={false}
        categories={[]}
        brands={[]}
        locale="en"
        currency="USD"
        messages={en}
        inStockOnly={false}
      />
    </CartProvider>,
  );
}

describe('ProductListView', () => {
  it('renders the grid idle (no pending navigation feedback)', () => {
    renderView();
    const name = screen.getByText('Test Laptop 15');
    expect(name).toBeVisible();
    // The dimming wrapper only carries aria-busy while a filter navigation
    // is in flight; idle renders must not announce busyness.
    expect(name.closest('div[aria-busy]')).toBeNull();
  });
});
