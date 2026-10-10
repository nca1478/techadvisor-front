import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { ReviewSummary } from '@/lib/api/reviews';
import type { Dictionary } from '@/lib/i18n/index';

export interface ReviewSummaryViewProps {
  summary: ReviewSummary;
  messages: Dictionary['reviews'];
}

/**
 * Presentational pros/cons summary. Bullets are short LLM paraphrases over
 * published reviews (never long quotes, never author data); the notice
 * states the automatic origin and the review count. Renders nothing when
 * both lists are empty.
 */
export function ReviewSummaryView({ summary, messages }: ReviewSummaryViewProps) {
  if (summary.pros.length === 0 && summary.cons.length === 0) {
    return null;
  }
  return (
    <Card>
      <Stack gap="sm">
        <Heading level={3}>{messages.summaryTitle}</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {summary.pros.length > 0 ? (
            <Stack gap="sm">
              <Text variant="small" as="span" className="font-semibold">
                {messages.prosTitle}
              </Text>
              <ul className="flex flex-col gap-1.5">
                {summary.pros.map((pro, index) => (
                  <li key={index} className="text-sm leading-relaxed text-foreground">
                    <span aria-hidden="true" className="text-success">
                      +{' '}
                    </span>
                    {pro}
                  </li>
                ))}
              </ul>
            </Stack>
          ) : null}
          {summary.cons.length > 0 ? (
            <Stack gap="sm">
              <Text variant="small" as="span" className="font-semibold">
                {messages.consTitle}
              </Text>
              <ul className="flex flex-col gap-1.5">
                {summary.cons.map((con, index) => (
                  <li key={index} className="text-sm leading-relaxed text-foreground">
                    <span aria-hidden="true" className="text-destructive">
                      −{' '}
                    </span>
                    {con}
                  </li>
                ))}
              </ul>
            </Stack>
          ) : null}
        </div>
        <Text variant="caption" tone="muted" role="status">
          {messages.summaryNotice.replace('{count}', String(summary.basedOnCount))}
        </Text>
      </Stack>
    </Card>
  );
}
