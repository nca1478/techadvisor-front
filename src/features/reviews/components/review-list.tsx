import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { formatAverageRating, type ProductReview } from '@/lib/api/reviews';
import type { Dictionary } from '@/lib/i18n/index';
import { ReviewStars } from './review-stars';

export interface ReviewListViewProps {
  reviews: ProductReview[];
  total: number;
  averageRating: number | null;
  /** BCP 47 locale for date formatting. */
  locale: string;
  messages: Dictionary['reviews'];
}

/** Formats an ISO date in the UI locale (date only, no time). */
export function formatReviewDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
  } catch {
    return iso;
  }
}

/**
 * Presentational published-review list (Container/Presenter: data arrives
 * via props, no fetching here). Shows the average headline, one card per
 * review with stars, verified badge and date, and the empty state.
 */
export function ReviewListView({
  reviews,
  total,
  averageRating,
  locale,
  messages,
}: ReviewListViewProps) {
  const average = formatAverageRating(averageRating);
  return (
    <Stack gap="md">
      <Heading level={3}>{messages.title}</Heading>
      {total === 0 ? (
        <Text tone="muted">{messages.empty}</Text>
      ) : (
        <Stack gap="sm">
          {average !== null ? (
            <Text variant="small" tone="muted" role="status">
              {messages.averageLabel.replace('{avg}', average).replace('{count}', String(total))}
            </Text>
          ) : null}
          <ul className="flex flex-col gap-3">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="overflow-hidden rounded-md border border-border bg-surface px-4 py-3"
              >
                <Stack gap="sm">
                  <Stack direction="horizontal" gap="sm" align="center">
                    <ReviewStars
                      rating={review.rating}
                      label={messages.starsLabel.replace('{rating}', String(review.rating))}
                    />
                    {review.verifiedPurchase ? (
                      <Badge tone="success">{messages.verifiedBadge}</Badge>
                    ) : null}
                  </Stack>
                  <Text as="span" variant="small" className="font-semibold">
                    {review.title}
                  </Text>
                  <Text variant="small" tone="muted">
                    {review.body}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {formatReviewDate(review.createdAt, locale)}
                  </Text>
                </Stack>
              </li>
            ))}
          </ul>
        </Stack>
      )}
    </Stack>
  );
}
