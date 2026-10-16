'use client';

import { useCallback, useRef, useState } from 'react';
import type { FeedbackValue, SupportResponse } from '@/lib/api/advisor';
import type { Dictionary } from '@/lib/i18n/index';
import { SupportView, type SupportStatus } from '../components/support-view';

export interface SupportAssistantProps {
  locale: string;
  messages: Dictionary['support'];
}

interface ErrorBody {
  code?: unknown;
  message?: unknown;
}

function friendlyError(
  status: number,
  body: unknown,
  messages: Dictionary['support'],
  orderScoped: boolean,
): string {
  const code = body !== null && typeof body === 'object' ? (body as ErrorBody).code : undefined;
  if (status === 429 || code === 'TOO_MANY_REQUESTS') return messages.rateLimitError;
  // On this endpoint 404 only happens for order lookups (other users' or
  // unknown ids); general policy questions never 404.
  if (status === 404) return messages.orderNotFoundError;
  if (status === 401 || code === 'UNAUTHORIZED') return messages.authRequiredError;
  if (status === 503 || code === 'SERVICE_UNAVAILABLE') return messages.providerError;
  if (status === 0) return messages.networkError;
  return orderScoped && status === 400 ? messages.orderNotFoundError : messages.genericError;
}

interface SupportReply {
  status: number;
  body: unknown;
}

async function postSupport(input: {
  question: string;
  orderId: string | null;
  locale: string;
}): Promise<SupportReply> {
  const res = await fetch('/api/advisor/support', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(
      input.orderId === null
        ? { question: input.question, locale: input.locale }
        : { question: input.question, orderId: input.orderId, locale: input.locale },
    ),
  });
  const body: unknown = await res.json().catch(() => null);
  return { status: res.status, body };
}

function isSupportResponse(value: unknown): value is SupportResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { answer?: unknown }).answer === 'string' &&
    Array.isArray((value as { citations?: unknown }).citations) &&
    typeof (value as { abstained?: unknown }).abstained === 'boolean'
  );
}

/**
 * Container (Client Component): owns question/order state, BFF fetching,
 * error mapping and result state. Renders `SupportView` with props only.
 * The order number is optional and sent only when non-empty; order-scoped
 * 404s map to the "order not found in your account" message.
 */
export function SupportAssistant({ locale, messages }: SupportAssistantProps) {
  const [question, setQuestion] = useState('');
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState<SupportStatus>('idle');
  const [result, setResult] = useState<SupportResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackValue | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const answerRef = useRef(0);

  const ask = useCallback(
    async (value: string, orderValue: string) => {
      const trimmed = value.trim();
      if (trimmed.length === 0) return;
      const normalizedOrder = orderValue.trim();
      const callId = answerRef.current + 1;
      answerRef.current = callId;
      const stale = () => answerRef.current !== callId;
      setStatus('loading');
      setErrorMessage(null);
      setFeedback(null);
      setFeedbackSent(false);
      try {
        const reply = await postSupport({
          question: trimmed,
          orderId: normalizedOrder.length > 0 ? normalizedOrder : null,
          locale,
        });
        if (stale()) return;
        if (reply.status < 200 || reply.status >= 300) {
          setStatus('error');
          setErrorMessage(
            friendlyError(reply.status, reply.body, messages, normalizedOrder.length > 0),
          );
          return;
        }
        if (!isSupportResponse(reply.body)) {
          setStatus('error');
          setErrorMessage(messages.genericError);
          return;
        }
        setResult(reply.body);
        setStatus(reply.body.abstained ? 'abstained' : 'answered');
      } catch {
        if (stale()) return;
        setStatus('error');
        setErrorMessage(friendlyError(0, null, messages, false));
      }
    },
    [locale, messages],
  );

  const handleSubmit = useCallback(() => {
    void ask(question, orderId);
  }, [ask, orderId, question]);

  const handleFeedback = useCallback(
    (value: FeedbackValue) => {
      if (result === null || feedbackSent) return;
      setFeedback(value);
      // Fire-and-forget: el voto alimenta el panel admin del asesor.
      void fetch('/api/advisor/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
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
    [feedbackSent, question, result],
  );

  return (
    <section aria-labelledby="support-heading">
      <span id="support-heading" className="sr-only">
        {messages.assistantTitle}
      </span>
      <SupportView
        question={question}
        onQuestionChange={setQuestion}
        orderId={orderId}
        onOrderIdChange={setOrderId}
        onSubmit={handleSubmit}
        status={status}
        result={result}
        errorMessage={errorMessage}
        onRetry={() => {
          void ask(question, orderId);
        }}
        feedback={feedback}
        feedbackSent={feedbackSent}
        onFeedback={handleFeedback}
        locale={locale}
        messages={messages}
      />
    </section>
  );
}
