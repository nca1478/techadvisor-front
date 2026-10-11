import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDictionarySync } from '@/lib/i18n/index';
import { ProductDetailTabs } from './product-detail-tabs';

const messages = getDictionarySync('es');

let sessionStatus: 'loading' | 'authenticated' | 'anonymous' = 'authenticated';

vi.mock('@/features/auth/session-context', () => ({
  useSession: () => ({ status: sessionStatus, user: null }),
}));

const LIST = {
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
  total: 1,
  page: 1,
  limit: 10,
  averageRating: 5,
};

const SUMMARY = { summary: null };

function mockFetch() {
  const fetchMock = vi.fn().mockImplementation((url: string) =>
    Promise.resolve({
      ok: true,
      json: () => {
        if (typeof url === 'string' && url.includes('/api/advisor/sessions')) return { id: 's1' };
        if (typeof url === 'string' && url.includes('/summary')) return SUMMARY;
        return LIST;
      },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderTabs() {
  return render(
    <ProductDetailTabs
      productId="p1"
      categorySlug="laptops"
      locale="es"
      supportHref="/es/soporte"
      loginHref="/es/ingresar?next=%2Fes%2Fproductos%2Fdemo"
      loginLabel={messages.auth.loginLink}
      messages={messages}
    />,
  );
}

describe('ProductDetailTabs', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    sessionStatus = 'authenticated';
    mockFetch();
  });

  it('shows customer reviews by default without mounting the other panels', async () => {
    renderTabs();
    expect(await screen.findByText('Gran portátil')).toBeInTheDocument();
    // Form and advisor stay unmounted until their tab opens.
    expect(screen.queryByLabelText(messages.reviews.ratingLabel)).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(messages.advisor.questionPlaceholder),
    ).not.toBeInTheDocument();
  });

  it('opens the write-review form on its tab for authenticated users', async () => {
    renderTabs();
    await screen.findByText('Gran portátil');
    fireEvent.click(screen.getByRole('tab', { name: messages.reviews.formTitle }));
    expect(screen.getByLabelText(messages.reviews.ratingLabel)).toBeInTheDocument();
    expect(screen.queryByText('Gran portátil')).not.toBeInTheDocument();
  });

  it('shows the login call-to-action on the write tab for anonymous visitors', async () => {
    sessionStatus = 'anonymous';
    renderTabs();
    await screen.findByText('Gran portátil');
    fireEvent.click(screen.getByRole('tab', { name: messages.reviews.formTitle }));
    expect(screen.getByText(messages.reviews.loginRequired)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: messages.auth.loginLink })).toHaveAttribute(
      'href',
      '/es/ingresar?next=%2Fes%2Fproductos%2Fdemo',
    );
  });

  it('opens the advisor widget on its tab', async () => {
    renderTabs();
    await screen.findByText('Gran portátil');
    fireEvent.click(screen.getByRole('tab', { name: messages.advisor.title }));
    expect(screen.getByPlaceholderText(messages.advisor.questionPlaceholder)).toBeInTheDocument();
  });

  it('keeps keyboard tab order reviews, write, advisor', () => {
    renderTabs();
    const tabs = screen.getAllByRole('tab').map((tab) => tab.textContent);
    expect(tabs).toEqual([
      messages.reviews.title,
      messages.reviews.formTitle,
      messages.advisor.title,
    ]);
  });

  it('renders every panel with the same chrome (h2 card title matching its tab)', async () => {
    renderTabs();
    await screen.findByText('Gran portátil');
    // Panel 1: the tab trigger and the card title share the label; the title is a level-2 heading.
    expect(screen.getAllByText(messages.reviews.title)).toHaveLength(2);
    expect(within(screen.getByRole('tabpanel')).getByText(messages.reviews.title).tagName).toBe(
      'H2',
    );

    fireEvent.click(screen.getByRole('tab', { name: messages.reviews.formTitle }));
    expect(within(screen.getByRole('tabpanel')).getByText(messages.reviews.formTitle).tagName).toBe(
      'H2',
    );

    fireEvent.click(screen.getByRole('tab', { name: messages.advisor.title }));
    // The advisor panel repeats its title in an sr-only section label: the
    // card title is the level-2 heading among the matches.
    expect(
      within(screen.getByRole('tabpanel'))
        .getAllByText(messages.advisor.title)
        .map((element) => element.tagName),
    ).toContain('H2');
  });
});
