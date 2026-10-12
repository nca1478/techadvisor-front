import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import en from '@/messages/en.json';
import { CartProvider } from '@/features/cart/cart-context';
import type { SearchResult } from '@/lib/api/search';
import { SearchResults } from './search-results';

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

function result(): SearchResult {
  return {
    product: {
      id: 'id-1',
      sku: 'SKU-1',
      name: 'Light Headphones',
      slug: 'light-headphones',
      description: 'Comfortable for long sessions.',
      brand: { id: 'b1', name: 'TestBrand', slug: 'testbrand' },
      category: {
        id: 'c1',
        name: 'Audio',
        slug: 'audio',
        parentSlug: null,
        specsSchema: [],
        locale: 'en',
      },
      priceAmount: 10000,
      currency: 'USD',
      specs: {},
      inStock: true,
      availableQuantity: 5,
      imageUrl: null,
      imageAlt: null,
      locale: 'en',
      createdAt: '2026-10-06T12:00:00.000Z',
    },
    score: 0.032,
    snippet: 'lightweight and comfortable for long hours',
  };
}

function renderResults(results: SearchResult[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((): Promise<Response> =>
      Promise.resolve(new Response(JSON.stringify(emptyCart), { status: 200 })),
    ),
  );
  render(
    <CartProvider>
      <SearchResults
        results={results}
        locale="en"
        currency="USD"
        catalogMessages={en.catalog}
        detailHrefFor={(slug) => `/en/productos/${slug}`}
      />
    </CartProvider>,
  );
}

describe('SearchResults', () => {
  it('renders product cards without evidence snippets', () => {
    renderResults([result()]);

    expect(screen.getByText('Light Headphones')).toBeVisible();
    expect(screen.getByText('$100.00')).toBeVisible();
    expect(
      screen.queryByText('lightweight and comfortable for long hours'),
    ).not.toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: 'Light Headphones' });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/en/productos/light-headphones');
    }
  });
});
