'use client';

import { useCallback, useRef, useState } from 'react';
import type { FeedbackValue } from '@/lib/api/advisor';
import type { Dictionary } from '@/lib/i18n/index';
import { suggestedQuestionKeys } from '../suggested-questions';
import { AdvisorView, type AdvisorResult, type AdvisorStatus } from '../components/advisor-view';

export interface ProductAdvisorProps {
  productId: string;
  categorySlug: string | null;
  locale: string;
  supportHref: string;
  messages: Dictionary['advisor'];
}

interface ErrorBody {
  code?: unknown;
  message?: unknown;
}

function friendlyError(status: number, body: unknown, messages: Dictionary['advisor']): string {
  const code = body !== null && typeof body === 'object' ? (body as ErrorBody).code : undefined;
  if (status === 429 || code === 'TOO_MANY_REQUESTS') return messages.rateLimitError;
  if (status === 404) return messages.notFoundError;
  if (status === 503 || code === 'SERVICE_UNAVAILABLE') return messages.providerError;
  if (status === 0) return messages.networkError;
  return messages.genericError;
}

/**
 * Container (Client Component): owns question state, BFF fetching, error
 * mapping and feedback. Renders `AdvisorView` with props only.
 */
export function ProductAdvisor({
  productId,
  categorySlug,
  locale,
  supportHref,
  messages,
}: ProductAdvisorProps) {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<AdvisorStatus>('idle');
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackValue | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const answerRef = useRef(0);
  const suggestedKeys = suggestedQuestionKeys(categorySlug);

  const resolveSuggestion = useCallback(
    (key: string): string => {
      const table = messages.suggested as unknown as Record<string, string>;
      return table[key] ?? key;
    },
    [messages],
  );

  const ask = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length === 0) return;
      const callId = answerRef.current + 1;
      answerRef.current = callId;
      setStatus('loading');
      setErrorMessage(null);
      setFeedback(null);
      setFeedbackSent(false);
      try {
        const res = await fetch('/api/advisor/product-qa', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ productId, question: trimmed, locale }),
        });
        const body: unknown = await res.json().catch(() => null);
        if (answerRef.current !== callId) return;
        if (!res.ok) {
          setStatus('error');
          setErrorMessage(friendlyError(res.status, body, messages));
          return;
        }
        const parsed = body as AdvisorResult | null;
        if (
          parsed === null ||
          typeof parsed !== 'object' ||
          typeof (parsed as { answer?: unknown }).answer !== 'string' ||
          !Array.isArray((parsed as { citations?: unknown }).citations) ||
          typeof (parsed as { abstained?: unknown }).abstained !== 'boolean'
        ) {
          setStatus('error');
          setErrorMessage(messages.genericError);
          return;
        }
        setResult(parsed);
        setStatus(parsed.abstained ? 'abstained' : 'answered');
      } catch {
        if (answerRef.current !== callId) return;
        setStatus('error');
        setErrorMessage(friendlyError(0, null, messages));
      }
    },
    [locale, messages, productId],
  );

  const handleSubmit = useCallback(() => {
    void ask(question);
  }, [ask, question]);

  const handleFeedback = useCallback(
    (value: FeedbackValue) => {
      if (result === null || feedbackSent) return;
      setFeedback(value);
      // Fire-and-forget: the stub endpoint may 404 until the backend
      // ships POST /advisor/feedback; the UI thanks anyway.
      void fetch('/api/advisor/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          productId,
          question: question.trim(),
          answer: result.answer,
          abstained: result.abstained,
          value,
        }),
      })
        .catch(() => null)
        .finally(() => {
          setFeedbackSent(true);
        });
    },
    [feedbackSent, productId, question, result],
  );

  return (
    <section aria-labelledby="advisor-heading">
      <span id="advisor-heading" className="sr-only">
        {messages.title}
      </span>
      <AdvisorView
        title={messages.title}
        question={question}
        onQuestionChange={setQuestion}
        onSubmit={handleSubmit}
        status={status}
        result={result}
        errorMessage={errorMessage}
        onRetry={() => {
          void ask(question);
        }}
        suggestedKeys={suggestedKeys}
        resolveSuggestion={resolveSuggestion}
        onPickSuggestion={(value) => {
          setQuestion(value);
          void ask(value);
        }}
        feedback={feedback}
        feedbackSent={feedbackSent}
        onFeedback={handleFeedback}
        locale={locale}
        supportHref={supportHref}
        messages={messages}
      />
    </section>
  );
}
