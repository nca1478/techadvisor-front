'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdvisorAnswer } from '@/features/advisor';
import type { SupportResponse } from '@/lib/api/advisor';
import type { Dictionary } from '@/lib/i18n/index';

export type SupportStatus = 'idle' | 'loading' | 'answered' | 'abstained' | 'error';

export interface SupportViewProps {
  question: string;
  onQuestionChange: (value: string) => void;
  orderId: string;
  onOrderIdChange: (value: string) => void;
  onSubmit: () => void;
  status: SupportStatus;
  result: SupportResponse | null;
  errorMessage: string | null;
  onRetry: () => void;
  locale: string;
  messages: Dictionary['support'];
}

/**
 * Presentational post-sale support widget: question box plus an optional
 * order number, loading state, cited answer or distinct abstention (handed
 * to a human), and friendly errors. No fetching here — the container owns
 * data and state.
 */
export function SupportView({
  question,
  onQuestionChange,
  orderId,
  onOrderIdChange,
  onSubmit,
  status,
  result,
  errorMessage,
  onRetry,
  locale,
  messages,
}: SupportViewProps) {
  const loading = status === 'loading';
  const showResult = (status === 'answered' || status === 'abstained') && result !== null;

  return (
    <Card>
      <Stack gap="md">
        <Stack gap="sm">
          <Heading level={2}>{messages.assistantTitle}</Heading>
          <Text variant="small" tone="muted">
            {messages.assistantSubtitle}
          </Text>
        </Stack>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-2"
        >
          <Input
            label={messages.questionLabel}
            name="support-question"
            placeholder={messages.questionPlaceholder}
            value={question}
            maxLength={1000}
            disabled={loading}
            onChange={(event) => {
              onQuestionChange(event.target.value);
            }}
          />
          <Input
            label={messages.orderIdLabel}
            name="support-order-id"
            placeholder={messages.orderIdPlaceholder}
            value={orderId}
            maxLength={36}
            disabled={loading}
            hint={messages.orderIdHint}
            onChange={(event) => {
              onOrderIdChange(event.target.value);
            }}
          />
          <div>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || question.trim().length === 0}
            >
              {messages.ask}
            </Button>
          </div>
        </form>

        {loading && (
          <Text variant="small" tone="muted" role="status">
            {messages.loading}
          </Text>
        )}

        {status === 'error' && (
          <div role="alert" className="rounded-md border border-destructive px-3 py-2">
            <Text variant="small">{errorMessage ?? messages.genericError}</Text>
            <div className="mt-2">
              <Button variant="secondary" size="sm" onClick={onRetry}>
                {messages.retry}
              </Button>
            </div>
          </div>
        )}

        {showResult && (
          <div aria-live="polite" className="flex flex-col gap-3">
            {result.abstained ? (
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <Badge tone="neutral">{messages.abstentionBadge}</Badge>
                <Text variant="small" className="mt-1.5">
                  {result.answer}
                </Text>
              </div>
            ) : (
              <AdvisorAnswer
                answer={result.answer}
                citations={result.citations}
                locale={locale}
                sourceLabel={messages.sourceLabel}
                showSnippetLabel={messages.showSnippet}
                hideSnippetLabel={messages.hideSnippet}
              />
            )}
          </div>
        )}

        <Text variant="caption" tone="muted">
          {messages.disclaimer}
        </Text>
        <Text variant="caption" tone="muted">
          {messages.privacyNote}
        </Text>
      </Stack>
    </Card>
  );
}
