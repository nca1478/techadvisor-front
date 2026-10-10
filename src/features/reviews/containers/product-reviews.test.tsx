import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Dictionary } from '@/lib/i18n/index';
import { getDictionarySync } from '@/lib/i18n/index';
import { ProductReviews } from './product-reviews';

const messages: Dictionary['reviews'] = getDictionarySync('es').reviews;

const LIST_PAGE_1 = {
  data: [
    {
      id: 'r1',
      productId: 'p1',
      rating: 5,
      title: 'Gran portátil',
      body: 'Rápido.',
      verifiedPurchase: true,
      createdAt: '2026-02-01T10:00:00.000Z',
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
  averageRating: 4.5,
};

const SUMMARY = {
  summary: {
    productId: 'p1',
    pros: ['Batería duradera'],
    cons: ['Algo pesado'],
    basedOnCount: 2,
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
};

function mockFetch(handler: (url: string) => unknown) {
  const fetchMock = vi.fn().mockImplementation((url: string) =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(handler(url)),
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ProductReviews', () => {
  it('renders the summary notice with the count plus the review list and form', async () => {
    mockFetch((url) => (url.includes('/summary') ? SUMMARY : LIST_PAGE_1));

    render(<ProductReviews productId="p1" locale="es" messages={messages} />);

    // Summary with the required automatic-origin notice.
    expect(await screen.findByText(messages.summaryTitle)).toBeInTheDocument();
    expect(screen.getByText(messages.summaryNotice.replace('{count}', '2'))).toBeInTheDocument();
    expect(screen.getByText('Gran portátil')).toBeInTheDocument();
    expect(screen.getByText(messages.formTitle)).toBeInTheDocument();
  });

  it('loads the next page on demand', async () => {
    const page2 = {
      data: [
        {
          id: 'r2',
          productId: 'p1',
          rating: 4,
          title: 'Bueno',
          body: 'Cumple.',
          verifiedPurchase: true,
          createdAt: '2026-02-02T10:00:00.000Z',
        },
      ],
      total: 2,
      page: 2,
      limit: 10,
      averageRating: 4.5,
    };
    mockFetch((url) => {
      if (url.includes('/summary')) return SUMMARY;
      if (url.includes('page=2')) return page2;
      return LIST_PAGE_1;
    });

    render(<ProductReviews productId="p1" locale="es" messages={messages} />);
    await screen.findByText('Gran portátil');

    fireEvent.click(screen.getByRole('button', { name: messages.loadMore }));

    await waitFor(() => {
      expect(screen.getByText('Bueno')).toBeInTheDocument();
    });
  });

  it('retries after a load failure', async () => {
    const fetchMock = mockFetch(() => {
      throw new Error('down');
    });

    render(<ProductReviews productId="p1" locale="es" messages={messages} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(messages.loadError);

    fetchMock.mockImplementation((url: string) =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(url.includes('/summary') ? SUMMARY : LIST_PAGE_1),
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: messages.retry }));

    expect(await screen.findByText('Gran portátil')).toBeInTheDocument();
  });
});
