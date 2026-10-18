'use client';

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import en from '@/messages/en.json';
import { CartProvider } from '@/features/cart/cart-context';
import type { CatalogCategory } from '@/lib/api/catalog';
import type { SearchResponse } from '@/lib/api/search';
import { SearchView } from './search-view';

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
let currentParams = 'q=headphones';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh }),
  usePathname: () => '/en/buscar',
  useSearchParams: () => new URLSearchParams(currentParams),
}));

const emptyCart = {
  id: 'cart-1',
  currency: 'USD',
  locale: 'en',
  items: [],
  totalAmount: 0,
  itemCount: 0,
};

const categories: CatalogCategory[] = [
  {
    id: 'c1',
    name: 'Audio',
    slug: 'audio',
    parentSlug: null,
    imageUrl: null,
    imageAlt: null,
    showInHome: true,
    specsSchema: [],
    locale: 'en',
  },
];

function response(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    query: 'headphones',
    degraded: false,
    locale: 'en',
    currency: 'USD',
    results: [
      {
        product: {
          id: 'id-1',
          sku: 'SKU-1',
          name: 'Light Headphones',
          slug: 'light-headphones',
          description: 'Comfortable for long sessions.',
          brand: { id: 'b1', name: 'TestBrand', slug: 'testbrand' },
          category: categories[0] ?? {
            id: 'c1',
            name: 'Audio',
            slug: 'audio',
            parentSlug: null,
            imageUrl: null,
            imageAlt: null,
            showInHome: true,
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
        snippet: 'lightweight evidence',
      },
    ],
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  currentParams = 'q=headphones';
});

function renderView(props: {
  initialData?: SearchResponse | null;
  loadError?: boolean;
  query?: string;
  initialCategory?: string;
  initialMaxPriceMinor?: number | null;
}) {
  vi.stubGlobal(
    'fetch',
    vi.fn((): Promise<Response> =>
      Promise.resolve(new Response(JSON.stringify(emptyCart), { status: 200 })),
    ),
  );
  render(
    <CartProvider>
      <SearchView
        initialData={props.initialData ?? response()}
        loadError={props.loadError ?? false}
        categories={categories}
        locale="en"
        currency="USD"
        messages={en}
        query={props.query ?? 'headphones'}
        initialCategory={props.initialCategory ?? ''}
        initialMaxPriceMinor={props.initialMaxPriceMinor ?? null}
      />
    </CartProvider>,
  );
}

describe('SearchView', () => {
  it('renders results without evidence snippets and no degraded notice by default', () => {
    renderView({});

    expect(screen.getByText('Light Headphones')).toBeVisible();
    expect(screen.queryByText('lightweight evidence')).not.toBeInTheDocument();
    expect(screen.queryByText(en.search.degradedNotice)).not.toBeInTheDocument();
  });

  it('shows the degraded notice when results are full-text only', () => {
    renderView({ initialData: response({ degraded: true }) });

    expect(screen.getByText(en.search.degradedNotice)).toBeVisible();
  });

  it('shows empty and error states', () => {
    const { unmount } = render(
      <CartProvider>
        <SearchView
          initialData={response({ results: [] })}
          loadError={false}
          categories={categories}
          locale="en"
          currency="USD"
          messages={en}
          query="zzz"
          initialCategory=""
          initialMaxPriceMinor={null}
        />
      </CartProvider>,
    );
    expect(screen.getByText(en.search.empty)).toBeVisible();
    unmount();

    renderView({ initialData: null, loadError: true });
    expect(screen.getByText(en.search.loadError)).toBeVisible();
  });

  it('applies category and max-price filters through the URL in minor units', () => {
    renderView({});

    fireEvent.change(screen.getByLabelText(en.search.categoryLabel), {
      target: { value: 'audio' },
    });
    fireEvent.change(screen.getByLabelText(en.search.maxPriceLabel), {
      target: { value: '150' },
    });
    fireEvent.click(screen.getByRole('button', { name: en.search.applyFilters }));

    expect(replace).toHaveBeenCalledWith('/en/buscar?q=headphones&category=audio&maxPrice=15000', {
      scroll: false,
    });
  });

  it('edits the query on the page so filters work without the header bar', () => {
    currentParams = '';
    vi.stubGlobal(
      'fetch',
      vi.fn((): Promise<Response> =>
        Promise.resolve(new Response(JSON.stringify(emptyCart), { status: 200 })),
      ),
    );
    render(
      <CartProvider>
        <SearchView
          initialData={null}
          loadError={false}
          categories={categories}
          locale="en"
          currency="USD"
          messages={en}
          query=""
          initialCategory=""
          initialMaxPriceMinor={null}
        />
      </CartProvider>,
    );

    fireEvent.change(screen.getByLabelText(en.search.label), {
      target: { value: 'grafica' },
    });
    fireEvent.change(screen.getByLabelText(en.search.categoryLabel), {
      target: { value: 'audio' },
    });
    fireEvent.click(screen.getByRole('button', { name: en.search.applyFilters }));

    expect(replace).toHaveBeenCalledWith('/en/buscar?q=grafica&category=audio', {
      scroll: false,
    });
  });

  it('rejects an invalid max price without navigating', () => {
    renderView({});

    fireEvent.change(screen.getByLabelText(en.search.maxPriceLabel), {
      target: { value: '-5' },
    });
    fireEvent.click(screen.getByRole('button', { name: en.search.applyFilters }));

    expect(screen.getByText(en.search.maxPriceInvalid)).toBeVisible();
    expect(replace).not.toHaveBeenCalled();
  });
});
