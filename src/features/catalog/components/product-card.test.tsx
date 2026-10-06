import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import en from '@/messages/en.json';
import type { ProductListItem } from '@/lib/api/catalog';
import { CartProvider } from '@/features/cart/cart-context';
import { ProductCard } from './product-card';

function product(overrides: Partial<ProductListItem> = {}): ProductListItem {
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
    imageUrl: 'https://placehold.co/600x400?text=Laptop' as unknown as ProductListItem['imageUrl'],
    imageAlt: 'Front view' as unknown as ProductListItem['imageAlt'],
    locale: 'en',
    createdAt: '2026-10-06T12:00:00.000Z',
    ...overrides,
  };
}

const messages = en.catalog;

const emptyCart = {
  id: 'cart-1',
  currency: 'USD',
  locale: 'en',
  items: [],
  totalAmount: 0,
  itemCount: 0,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

/** ProductCard embeds AddToCartButton, which reads the cart context. */
function renderCard(productOverrides: Partial<ProductListItem> = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn((): Promise<Response> =>
      Promise.resolve(new Response(JSON.stringify(emptyCart), { status: 200 })),
    ),
  );
  render(
    <CartProvider>
      <ProductCard
        product={product(productOverrides)}
        locale="en"
        currency="USD"
        messages={messages}
        detailHref="/en/productos/test-laptop-15"
      />
    </CartProvider>,
  );
}

describe('ProductCard', () => {
  it('renders the name, formatted price and in-stock badge', () => {
    renderCard();
    expect(screen.getByText('Test Laptop 15')).toBeVisible();
    expect(screen.getByText('$1,299.00')).toBeVisible();
    expect(screen.getByText(messages.inStock)).toBeVisible();
  });

  it('marks out-of-stock products clearly with a disabled action', () => {
    renderCard({ inStock: false, availableQuantity: 0 });
    expect(screen.getByText(messages.outOfStock)).toBeVisible();
    expect(screen.getByRole('button', { name: messages.addToCart })).toBeDisabled();
  });

  it('falls back to the product name when alt is missing and to the placeholder without images', () => {
    renderCard({ imageUrl: null, imageAlt: null });
    const image = screen.getByAltText('Test Laptop 15');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder') as string);
  });
});
