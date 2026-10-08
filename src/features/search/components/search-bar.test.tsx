'use client';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import en from '@/messages/en.json';
import type { SearchResponse } from '@/lib/api/search';
import { SearchBar } from './search-bar';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const messages = en.search;

function suggestionResponse(names: string[]): SearchResponse {
  return {
    query: 'audi',
    degraded: false,
    locale: 'en',
    currency: 'USD',
    results: names.map((name, index) => ({
      product: {
        id: `id-${String(index)}`,
        sku: `SKU-${String(index)}`,
        name,
        slug: `slug-${String(index)}`,
        description: 'A test product.',
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
      score: 0.01,
      snippet: 'evidence fragment',
    })),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function renderBar() {
  vi.stubGlobal(
    'fetch',
    vi.fn((): Promise<Response> =>
      Promise.resolve(
        new Response(JSON.stringify(suggestionResponse(['Audio One'])), { status: 200 }),
      ),
    ),
  );
  render(<SearchBar locale="en" messages={messages} />);
}

describe('SearchBar', () => {
  it('shows debounced suggestions and navigates to results on submit', async () => {
    renderBar();
    const input = screen.getByRole('combobox', { name: messages.label });

    fireEvent.change(input, { target: { value: 'audi' } });
    // Debounced (300 ms): suggestions appear only after the delay.
    await waitFor(() => {
      expect(screen.getByRole('option')).toBeVisible();
    });
    expect(screen.getByText('Audio One')).toBeVisible();

    fireEvent.submit(input.closest('form') as HTMLFormElement);
    expect(push).toHaveBeenCalledWith('/en/buscar?q=audi');
  });

  it('does not fetch suggestions for very short input', async () => {
    renderBar();
    const fetchMock = vi.mocked(fetch);
    const input = screen.getByRole('combobox', { name: messages.label });

    fireEvent.change(input, { target: { value: 'a' } });
    await new Promise((resolve) => setTimeout(resolve, 450));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes the dropdown on Escape', async () => {
    renderBar();
    const input = screen.getByRole('combobox', { name: messages.label });

    fireEvent.change(input, { target: { value: 'audi' } });
    await waitFor(() => {
      expect(screen.getByRole('option')).toBeVisible();
    });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
