'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { useSession } from '@/features/auth/session-context';
import {
  createReviewsApi,
  formatAverageRating,
  type ProductReview,
  type ReviewSummary,
} from '@/lib/api/reviews';
import { createApiClient } from '@/lib/api/client';
import type { Dictionary } from '@/lib/i18n/index';
import { ReviewForm } from '../components/review-form';
import { ReviewListView } from '../components/review-list';
import { ReviewSummaryView } from '../components/review-summary';

export interface ProductReviewsProps {
  productId: string;
  locale: string;
  messages: Dictionary['reviews'];
  /** Login destination (with `?next=` back to the product) for anonymous users. */
  loginHref: string;
  /** Localized label for the login call-to-action. */
  loginLabel: string;
}

const PAGE_SIZE = 2;

type LoadStatus = 'loading' | 'ready' | 'error';

/** First-page payload (list + summary); state updates stay in callers. */
async function fetchFirstPage(productId: string) {
  const api = createReviewsApi(createApiClient({ baseUrl: '/api' }));
  const [list, fetchedSummary] = await Promise.all([
    api.listPublished(productId, { page: 1, limit: PAGE_SIZE }),
    api.getSummary(productId),
  ]);
  return { list, fetchedSummary };
}

/**
 * Client container for the product-page reviews section. Reads through the
 * same-origin BFF (`/api/reviews/...`, no backend URL in the browser) and
 * composes the presentational summary, list and form.
 *
 * Reads (summary + published list) are public and render for everyone;
 * the write form lives in an advisor-style card and renders only for
 * authenticated users — anonymous visitors get a login call-to-action
 * instead (creation is buyers-only server-side, so an open form would only
 * ever answer 401).
 */
export function ProductReviews({
  productId,
  locale,
  messages,
  loginHref,
  loginLabel,
}: ProductReviewsProps) {
  return (
    <Stack gap="lg">
      <ProductReviewsList productId={productId} locale={locale} messages={messages} />
      <ReviewFormCard
        productId={productId}
        messages={messages}
        loginHref={loginHref}
        loginLabel={loginLabel}
      />
    </Stack>
  );
}

/**
 * Public reviews list section (summary + published reviews + pager).
 * Renders for everyone, authenticated or not. Same card chrome as the
 * advisor and write-review panels (`Card` + level-2 title) in every state
 * so the three tab pages look consistent.
 */
export function ProductReviewsList({
  productId,
  locale,
  messages,
}: {
  productId: string;
  locale: string;
  messages: Dictionary['reviews'];
}) {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  function applyFirstPage(
    list: {
      data: ProductReview[];
      total: number;
      averageRating: number | null;
    },
    fetchedSummary: ReviewSummary | null,
  ) {
    setReviews(list.data);
    setTotal(list.total);
    setAverageRating(list.averageRating);
    setSummary(fetchedSummary);
    setPage(1);
    setStatus('ready');
  }

  // Mount fetch: state updates happen in the promise continuation (never
  // synchronously in the effect body), with a cancellation guard.
  useEffect(() => {
    let cancelled = false;
    fetchFirstPage(productId)
      .then(({ list, fetchedSummary }) => {
        if (!cancelled) applyFirstPage(list, fetchedSummary);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleRetry() {
    setStatus('loading');
    try {
      const { list, fetchedSummary } = await fetchFirstPage(productId);
      applyFirstPage(list, fetchedSummary);
    } catch {
      setStatus('error');
    }
  }

  async function handlePageChange(nextPage: number) {
    if (loadingMore || nextPage === page) return;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (nextPage < 1 || nextPage > totalPages) return;
    setLoadingMore(true);
    try {
      const api = createReviewsApi(createApiClient({ baseUrl: '/api' }));
      const list = await api.listPublished(productId, { page: nextPage, limit: PAGE_SIZE });
      setReviews(list.data);
      setTotal(list.total);
      setAverageRating(list.averageRating);
      setPage(nextPage);
    } catch {
      setLoadingMore(false);
      await handleRetry();
      return;
    }
    setLoadingMore(false);
  }

  if (status === 'loading') {
    return (
      <Card>
        <Stack gap="md">
          <Heading level={2}>{messages.title}</Heading>
          <Text role="status">{messages.loadingMore}</Text>
        </Stack>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card>
        <Stack gap="md">
          <Heading level={2}>{messages.title}</Heading>
          <Stack gap="sm">
            <Text role="alert">{messages.loadError}</Text>
            <div>
              <Button variant="secondary" onClick={() => void handleRetry()}>
                {messages.retry}
              </Button>
            </div>
          </Stack>
        </Stack>
      </Card>
    );
  }

  const average = formatAverageRating(averageRating);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  return (
    <Card>
      <Stack gap="md">
        <Stack direction="horizontal" gap="sm" align="center" justify="between" wrap>
          <Heading level={2}>{messages.title}</Heading>
          {average !== null ? (
            <Text variant="small" tone="muted" role="status">
              {messages.averageLabel.replace('{avg}', average).replace('{count}', String(total))}
            </Text>
          ) : null}
        </Stack>
        {summary !== null ? <ReviewSummaryView summary={summary} messages={messages} bare /> : null}
        <ReviewListView reviews={reviews} total={total} locale={locale} messages={messages} />
        {total > 0 ? (
          <nav aria-label={messages.title}>
            <Stack gap="sm">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1 || loadingMore}
                  onClick={() => void handlePageChange(page - 1)}
                  aria-label={messages.previous}
                >
                  {messages.previous}
                </Button>
                {pageNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={loadingMore}
                    aria-current={pageNumber === page ? 'page' : undefined}
                    onClick={() => void handlePageChange(pageNumber)}
                  >
                    {String(pageNumber)}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages || loadingMore}
                  onClick={() => void handlePageChange(page + 1)}
                  aria-label={messages.next}
                >
                  {messages.next}
                </Button>
              </div>
              <Text variant="small" tone="muted" role="status" className="text-center">
                {messages.pageOf
                  .replace('{page}', String(page))
                  .replace('{totalPages}', String(totalPages))}
              </Text>
            </Stack>
          </nav>
        ) : null}
      </Stack>
    </Card>
  );
}

/**
 * Write-review card with the same design as the advisor widget card
 * (`AdvisorView`): `Card` + level-2 title + muted hint, then the form for
 * authenticated users or a login call-to-action for anonymous visitors.
 */
export function ReviewFormCard({
  productId,
  messages,
  loginHref,
  loginLabel,
}: {
  productId: string;
  messages: Dictionary['reviews'];
  loginHref: string;
  loginLabel: string;
}) {
  const { status: sessionStatus } = useSession();
  return (
    <Card>
      <Stack gap="md">
        <Stack gap="sm">
          <Heading level={2}>{messages.formTitle}</Heading>
          <Text variant="small" tone="muted">
            {messages.formHint}
          </Text>
        </Stack>
        {sessionStatus === 'loading' ? (
          <Text variant="small" tone="muted" role="status">
            {messages.loadingMore}
          </Text>
        ) : sessionStatus === 'authenticated' ? (
          <ReviewForm productId={productId} messages={messages} bare />
        ) : (
          <Stack gap="sm">
            <Text variant="small">{messages.loginRequired}</Text>
            <div>
              <Button href={loginHref}>{loginLabel}</Button>
            </div>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
