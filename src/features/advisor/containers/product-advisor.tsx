'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

interface QaReply {
  status: number;
  body: unknown;
}

async function postProductQa(input: {
  productId: string;
  question: string;
  locale: string;
  sessionId: string | null;
}): Promise<QaReply> {
  const res = await fetch('/api/advisor/product-qa', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(
      input.sessionId === null
        ? { productId: input.productId, question: input.question, locale: input.locale }
        : {
            productId: input.productId,
            question: input.question,
            locale: input.locale,
            sessionId: input.sessionId,
          },
    ),
  });
  const body: unknown = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function openChatSession(): Promise<string | null> {
  try {
    const res = await fetch('/api/advisor/sessions', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as { id?: unknown } | null;
    return typeof body?.id === 'string' ? body.id : null;
  } catch {
    return null;
  }
}

/**
 * Container (Client Component): owns question state, chat-session lifecycle,
 * BFF fetching, error mapping and feedback. Renders `AdvisorView` with props
 * only.
 *
 * A chat session opens when the widget mounts (remounted per product via
 * `key={product.id}`) and its id travels with every question so the backend
 * records the turn. Session failures degrade to stateless Q&A; a 404 on a
 * sessioned call rotates the session once (it may have been purged by
 * retention) and retries before showing an error.
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
  const [answeredSessionId, setAnsweredSessionId] = useState<string | null>(null);
  const answerRef = useRef(0);
  const sessionPromiseRef = useRef<Promise<string | null> | null>(null);
  const suggestedKeys = suggestedQuestionKeys(categorySlug);

  const ensureSession = useCallback((): Promise<string | null> => {
    if (sessionPromiseRef.current === null) {
      sessionPromiseRef.current = openChatSession();
    }
    return sessionPromiseRef.current;
  }, []);

  useEffect(() => {
    void ensureSession();
  }, [ensureSession]);

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
      const stale = () => answerRef.current !== callId;
      setStatus('loading');
      setErrorMessage(null);
      setFeedback(null);
      setFeedbackSent(false);
      try {
        const sessionId = await ensureSession();
        if (stale()) return;
        let reply = await postProductQa({ productId, question: trimmed, locale, sessionId });
        let effectiveSession = sessionId;
        if (stale()) return;
        if (reply.status === 404 && sessionId !== null) {
          // The session may be gone (retention purge): open a fresh one and
          // retry once before surfacing "not found".
          sessionPromiseRef.current = null;
          const fresh = await ensureSession();
          if (stale()) return;
          if (fresh !== null && fresh !== sessionId) {
            reply = await postProductQa({ productId, question: trimmed, locale, sessionId: fresh });
            effectiveSession = fresh;
            if (stale()) return;
          }
        }
        if (reply.status < 200 || reply.status >= 300) {
          setStatus('error');
          setErrorMessage(friendlyError(reply.status, reply.body, messages));
          return;
        }
        const parsed = reply.body as AdvisorResult | null;
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
        setAnsweredSessionId(effectiveSession);
        setStatus(parsed.abstained ? 'abstained' : 'answered');
      } catch {
        if (stale()) return;
        setStatus('error');
        setErrorMessage(friendlyError(0, null, messages));
      }
    },
    [ensureSession, locale, messages, productId],
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
          // Links the vote to its minimized conversation in the admin panel;
          // undefined fields are dropped by JSON.stringify when stateless.
          sessionId: answeredSessionId ?? undefined,
        }),
      })
        .catch(() => null)
        .finally(() => {
          setFeedbackSent(true);
        });
    },
    [feedbackSent, productId, question, result, answeredSessionId],
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
