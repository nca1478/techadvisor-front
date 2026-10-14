'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { AdvisorCitation, FeedbackValue } from '@/lib/api/advisor';
import type { Dictionary } from '@/lib/i18n/index';
import { AdvisorAnswer } from './advisor-answer';

export type AdvisorStatus = 'idle' | 'loading' | 'answered' | 'abstained' | 'error';

export interface AdvisorResult {
  answer: string;
  citations: AdvisorCitation[];
  abstained: boolean;
}

export interface AdvisorViewProps {
  title: string;
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  status: AdvisorStatus;
  result: AdvisorResult | null;
  errorMessage: string | null;
  onRetry: () => void;
  suggestedKeys: string[];
  resolveSuggestion: (key: string) => string;
  onPickSuggestion: (value: string) => void;
  feedback: FeedbackValue | null;
  feedbackSent: boolean;
  onFeedback: (value: FeedbackValue) => void;
  locale: string;
  supportHref: string;
  messages: Dictionary['advisor'];
}

export function AdvisorView({
  title,
  question,
  onQuestionChange,
  onSubmit,
  status,
  result,
  errorMessage,
  onRetry,
  suggestedKeys,
  resolveSuggestion,
  onPickSuggestion,
  feedback,
  feedbackSent,
  onFeedback,
  locale,
  supportHref,
  messages,
}: AdvisorViewProps) {
  const loading = status === 'loading';
  const showResult = (status === 'answered' || status === 'abstained') && result !== null;

  return (
    <Card>
      <Stack gap="md">
        <Stack gap="sm">
          <Heading level={2}>{title}</Heading>
          <Text variant="small" tone="muted">
            {messages.subtitle}
          </Text>
        </Stack>

        {suggestedKeys.length > 0 && (
          <div>
            <Text variant="small" tone="muted" className="mb-2 font-medium">
              {messages.suggestedLabel}
            </Text>
            <ul className="flex flex-wrap gap-2">
              {suggestedKeys.map((key) => (
                <li key={key}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={loading}
                    onClick={() => {
                      onPickSuggestion(resolveSuggestion(key));
                    }}
                  >
                    {resolveSuggestion(key)}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Input
              label={messages.questionLabel}
              name="advisor-question"
              placeholder={messages.questionPlaceholder}
              value={question}
              maxLength={1000}
              disabled={loading}
              onChange={(event) => {
                onQuestionChange(event.target.value);
              }}
            />
          </div>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || question.trim().length === 0}
          >
            {messages.ask}
          </Button>
        </form>

        {loading && (
          <Text variant="small" tone="muted" role="status">
            {messages.loading}
          </Text>
        )}

        {status === 'error' && (
          <div role="alert" className="rounded-lg border border-destructive/40 px-3 py-2">
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
              <div className="rounded-lg border border-border bg-surface-raise px-3 py-2">
                <Badge tone="neutral">{messages.abstentionBadge}</Badge>
                <Text variant="small" className="mt-1.5">
                  {result.answer}
                </Text>
                <Text variant="small" tone="muted" className="mt-1.5">
                  <a href={supportHref} className="text-link underline-offset-4 hover:underline">
                    {messages.supportLink}
                  </a>
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

            <div className="flex items-center gap-2">
              <Text variant="small" tone="muted">
                {feedbackSent ? messages.feedbackThanks : messages.feedbackLabel}
              </Text>
              <Button
                variant={feedback === 'up' ? 'primary' : 'secondary'}
                size="sm"
                aria-pressed={feedback === 'up'}
                aria-label={messages.feedbackUp}
                disabled={feedbackSent}
                onClick={() => {
                  onFeedback('up');
                }}
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5.5 7v6H2.8V7h2.7ZM5.5 7l2.6-4.2c.5-.1 1.1.3 1.1.9V6h3.4c.6 0 1 .5.9 1.1l-1.1 4.6c-.1.6-.7 1.1-1.3 1.1H5.5V7Z" />
                </svg>
              </Button>
              <Button
                variant={feedback === 'down' ? 'primary' : 'secondary'}
                size="sm"
                aria-pressed={feedback === 'down'}
                aria-label={messages.feedbackDown}
                disabled={feedbackSent}
                onClick={() => {
                  onFeedback('down');
                }}
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.5 9V3h2.7v6h-2.7ZM10.5 9l-2.6 4.2c-.5.1-1.1-.3-1.1-.9V10H3.4c-.6 0-1-.5-.9-1.1l1.1-4.6c.1-.6.7-1.1 1.3-1.1h5.6v6Z" />
                </svg>
              </Button>
            </div>
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
