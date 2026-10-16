'use client';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { FeedbackValue } from '@/lib/api/advisor';

export interface AdvisorFeedbackTexts {
  feedbackLabel: string;
  feedbackThanks: string;
  feedbackUp: string;
  feedbackDown: string;
}

/**
 * Reusable thumbs up/down vote (fire-and-forget POST /api/advisor/feedback).
 * Same tokens in product-QA, chat and support so votes feed the admin loop.
 */
export function AdvisorFeedback({
  feedback,
  feedbackSent,
  onFeedback,
  messages,
}: {
  feedback: FeedbackValue | null;
  feedbackSent: boolean;
  onFeedback: (value: FeedbackValue) => void;
  messages: AdvisorFeedbackTexts;
}) {
  return (
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
  );
}
