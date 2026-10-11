import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Dictionary } from '@/lib/i18n/index';
import { getDictionarySync } from '@/lib/i18n/index';
import { ProductReviews } from './product-reviews';

const dictionary = getDictionarySync('es');
const messages: Dictionary['reviews'] = dictionary.reviews;
const loginLabel = dictionary.auth.loginLink;

let sessionStatus: 'loading' | 'authenticated' | 'anonymous' = 'authenticated';

vi.mock('@/features/auth/session-context', () => ({
  useSession: () => ({ status: sessionStatus, user: null }),
}));

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

beforeEach(() => {
  sessionStatus = 'authenticated';
});

function renderReviews() {
  return render(
    <ProductReviews
      productId="p1"
      locale="es"
      messages={messages}
      loginHref="/es/ingresar?next=%2Fes%2Fproductos%2Fdemo"
      loginLabel={loginLabel}
    />,
  );
}

describe('ProductReviews', () => {
  it('renders the summary notice with the count plus the review list and form', async () => {
    mockFetch((url) => (url.includes('/summary') ? SUMMARY : LIST_PAGE_1));

    renderReviews();

    // Summary with the required automatic-origin notice.
    expect(await screen.findByText(messages.summaryTitle)).toBeInTheDocument();
    expect(screen.getByText(messages.summaryNotice.replace('{count}', '2'))).toBeInTheDocument();
    expect(screen.getByText('Gran portátil')).toBeInTheDocument();
    expect(screen.getByText(messages.formTitle)).toBeInTheDocument();
  });

  it('shows the published list to anonymous visitors with a login call-to-action', async () => {
    sessionStatus = 'anonymous';
    mockFetch((url) => (url.includes('/summary') ? SUMMARY : LIST_PAGE_1));

    renderReviews();

    // Reads are public: the list renders without a session.
    expect(await screen.findByText('Gran portátil')).toBeInTheDocument();
    // The write form is gated behind login.
    expect(screen.queryByLabelText(messages.ratingLabel)).not.toBeInTheDocument();
    expect(screen.getByText(messages.loginRequired)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: loginLabel })).toHaveAttribute(
      'href',
      '/es/ingresar?next=%2Fes%2Fproductos%2Fdemo',
    );
  });

  it('shows the write form to authenticated users', async () => {
    mockFetch((url) => (url.includes('/summary') ? SUMMARY : LIST_PAGE_1));

    renderReviews();

    expect(await screen.findByText('Gran portátil')).toBeInTheDocument();
    expect(screen.getByLabelText(messages.ratingLabel)).toBeInTheDocument();
    expect(screen.queryByText(messages.loginRequired)).not.toBeInTheDocument();
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

    renderReviews();
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

    renderReviews();
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
