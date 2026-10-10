'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { createReviewsApi, type ProductReview, type ReviewSummary } from '@/lib/api/reviews';
import { createApiClient } from '@/lib/api/client';
import type { Dictionary } from '@/lib/i18n/index';
import { ReviewForm } from '../components/review-form';
import { ReviewListView } from '../components/review-list';
import { ReviewSummaryView } from '../components/review-summary';

export interface ProductReviewsProps {
  productId: string;
  locale: string;
  messages: Dictionary['reviews'];
}

const PAGE_SIZE = 10;

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
 */
export function ProductReviews({ productId, locale, messages }: ProductReviewsProps) {
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

  async function handleLoadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const api = createReviewsApi(createApiClient({ baseUrl: '/api' }));
      const list = await api.listPublished(productId, { page: page + 1, limit: PAGE_SIZE });
      setReviews((previous) => [...previous, ...list.data]);
      setTotal(list.total);
      setPage((previous) => previous + 1);
    } catch {
      setLoadingMore(false);
      await handleRetry();
      return;
    }
    setLoadingMore(false);
  }

  if (status === 'loading') {
    return <Text role="status">{messages.loadingMore}</Text>;
  }

  if (status === 'error') {
    return (
      <Stack gap="sm">
        <Text role="alert">{messages.loadError}</Text>
        <div>
          <Button variant="secondary" onClick={() => void handleRetry()}>
            {messages.retry}
          </Button>
        </div>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {summary !== null ? <ReviewSummaryView summary={summary} messages={messages} /> : null}
      <ReviewListView
        reviews={reviews}
        total={total}
        averageRating={averageRating}
        locale={locale}
        messages={messages}
      />
      {total > reviews.length ? (
        <Stack gap="sm">
          <Text variant="small" tone="muted" role="status">
            {messages.showingOf
              .replace('{shown}', String(reviews.length))
              .replace('{total}', String(total))}
          </Text>
          <div>
            <Button variant="secondary" loading={loadingMore} onClick={() => void handleLoadMore()}>
              {messages.loadMore}
            </Button>
          </div>
        </Stack>
      ) : null}
      <ReviewForm productId={productId} messages={messages} />
    </Stack>
  );
}
