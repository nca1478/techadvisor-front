import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import en from '@/messages/en.json';
import type { ProductListItem } from '@/lib/api/catalog';
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

describe('ProductCard', () => {
  it('renders the name, formatted price and in-stock badge', () => {
    render(
      <ProductCard
        product={product()}
        locale="en"
        currency="USD"
        messages={messages}
        detailHref="/en/productos/test-laptop-15"
      />,
    );
    expect(screen.getByText('Test Laptop 15')).toBeVisible();
    expect(screen.getByText('$1,299.00')).toBeVisible();
    expect(screen.getByText(messages.inStock)).toBeVisible();
  });

  it('marks out-of-stock products clearly with a disabled action', () => {
    render(
      <ProductCard
        product={product({ inStock: false, availableQuantity: 0 })}
        locale="en"
        currency="USD"
        messages={messages}
        detailHref="/en/productos/test-laptop-15"
      />,
    );
    expect(screen.getByText(messages.outOfStock)).toBeVisible();
    expect(screen.getByRole('button', { name: messages.addToCart })).toBeDisabled();
  });

  it('falls back to the product name when alt is missing and to the placeholder without images', () => {
    render(
      <ProductCard
        product={product({
          imageUrl: null,
          imageAlt: null,
        })}
        locale="en"
        currency="USD"
        messages={messages}
        detailHref="/en/productos/test-laptop-15"
      />,
    );
    const image = screen.getByAltText('Test Laptop 15');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder') as string);
  });
});
