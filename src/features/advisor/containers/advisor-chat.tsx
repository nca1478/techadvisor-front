'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '@/features/cart/cart-context';
import {
  asAdvisorCitation,
  asRecommendProduct,
  chatSessionStorageKey,
  classifyAdvisorError,
  parseChatHistory,
  streamRecommendation,
  type AdvisorCitation,
  type ChatHistory,
  type RecommendProduct,
} from '@/lib/api/advisor';
import type { Dictionary } from '@/lib/i18n/index';
import { ChatWindow, type ChatBubble } from '../components/chat-window';

export interface AdvisorChatProps {
  locale: string;
  messages: Dictionary;
}

function errorTextFor(kind: ReturnType<typeof classifyAdvisorError>, messages: Dictionary): string {
  switch (kind) {
    case 'rate-limit':
      return messages.advisor.rateLimitError;
    case 'provider':
      return messages.advisor.providerError;
    case 'network':
      return messages.advisor.networkError;
    default:
      return messages.advisor.genericError;
  }
}

function historyToBubbles(history: ChatHistory): ChatBubble[] {
  return history.messages.map((message) =>
    message.role === 'USER'
      ? { id: message.id, role: 'user' as const, text: message.content }
      : {
          id: message.id,
          role: 'assistant' as const,
          text: message.content,
          citations: message.citations
            .map((citation) => asAdvisorCitation(citation))
            .filter((citation): citation is AdvisorCitation => citation !== null),
          products: message.products
            .map((product) => asRecommendProduct(product))
            .filter((product): product is RecommendProduct => product !== null),
        },
  );
}

function unionCitations(products: RecommendProduct[]): AdvisorCitation[] {
  const byNumber = new Map<number, AdvisorCitation>();
  for (const product of products) {
    for (const citation of product.citations) {
      if (!byNumber.has(citation.n)) byNumber.set(citation.n, citation);
    }
  }
  return [...byNumber.values()].sort((a, b) => a.n - b.n);
}

async function openSession(): Promise<string | null> {
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
 * Container (Client Component): owns the chat session lifecycle (guest and
 * authenticated — both ride the BFF cookies), history restore from
 * `localStorage` + backend, SSE streaming sends with a JSON fallback,
 * clarification quick-replies, errors with retry and add-to-cart.
 */
export function AdvisorChat({ locale, messages }: AdvisorChatProps) {
  const chat = messages.chat;
  const { addItem } = useCart();
  const storageKey = chatSessionStorageKey(locale);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [opening, setOpening] = useState(true);
  const [openFailed, setOpenFailed] = useState(false);
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingClarification, setPendingClarification] = useState(false);
  const [startingNewChat, setStartingNewChat] = useState(false);
  const lastSentRef = useRef('');
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const nextId = useCallback((prefix: string): string => {
    idRef.current += 1;
    return `${prefix}-${String(Date.now())}-${String(idRef.current)}`;
  }, []);

  const startFreshSession = useCallback(async (): Promise<string | null> => {
    const id = await openSession();
    if (id !== null) {
      try {
        window.localStorage.setItem(storageKey, id);
      } catch {
        // Private mode: the chat still works for this page view.
      }
      setSessionId(id);
    }
    return id;
  }, [storageKey]);

  // Mount: restore the stored session history, or open a fresh session.
  useEffect(() => {
    let cancelled = false;
    async function init(): Promise<void> {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(storageKey);
      } catch {
        stored = null;
      }
      if (stored) {
        try {
          const res = await fetch(`/api/advisor/sessions/${encodeURIComponent(stored)}`, {
            credentials: 'same-origin',
          });
          if (res.ok) {
            const body: unknown = await res.json().catch(() => null);
            if (!cancelled) {
              setSessionId(stored);
              setBubbles(historyToBubbles(parseChatHistory(body)));
              setOpening(false);
              return;
            }
          } else if (res.status !== 404 && !cancelled) {
            // Unusable history (but the session may still accept turns):
            // keep the session and show a notice instead of losing it.
            setSessionId(stored);
            setErrorMessage(chat.historyError);
            setOpening(false);
            return;
          }
        } catch {
          if (!cancelled) {
            setSessionId(stored);
            setErrorMessage(chat.historyError);
            setOpening(false);
            return;
          }
        }
        if (cancelled) return;
      }
      const id = await startFreshSession();
      if (!cancelled) {
        setOpenFailed(id === null);
        setOpening(false);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [chat.historyError, startFreshSession, storageKey]);

  // Abort any in-flight stream on unmount.
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const send = useCallback(
    async (
      text: string,
      options: { appendUser?: boolean; rotated?: boolean; sidOverride?: string } = {},
    ): Promise<void> => {
      const content = text.trim();
      if (content.length === 0 || sending) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const isAborted = (): boolean => controller.signal.aborted;
      lastSentRef.current = content;
      if (options.appendUser !== false) {
        setBubbles((prev) => [...prev, { id: nextId('u'), role: 'user', text: content }]);
      }
      setInput('');
      setSending(true);
      setStreamingText(null);
      setErrorMessage(null);
      setPendingClarification(false);
      try {
        const sid = options.sidOverride ?? sessionId ?? (await startFreshSession());
        if (sid === null || isAborted()) {
          if (!isAborted()) {
            setErrorMessage(chat.sessionError);
            setSending(false);
          }
          return;
        }
        let full = '';
        let result: { products: RecommendProduct[]; clarifyingQuestion?: string };
        try {
          result = await streamRecommendation(
            `/api/advisor/sessions/${encodeURIComponent(sid)}/messages`,
            { content, locale },
            {
              signal: controller.signal,
              onDelta: (delta) => {
                full += delta;
                setStreamingText(full);
              },
            },
          );
        } catch (error) {
          if (isAborted()) return;
          const status = (error as { status?: unknown }).status;
          const kind = classifyAdvisorError(
            typeof status === 'number' ? status : 0,
            (error as { body?: unknown }).body ?? null,
          );
          if (kind === 'not-found' && !options.rotated) {
            // The session is gone (retention purge or owner change):
            // rotate once and resend without duplicating the user bubble.
            try {
              window.localStorage.removeItem(storageKey);
            } catch {
              // Browsers sin almacenamiento: se sigue con la sesión nueva.
            }
            setSessionId(null);
            const fresh = await startFreshSession();
            if (fresh !== null && !isAborted()) {
              setSending(false);
              setStreamingText(null);
              await send(content, { appendUser: false, rotated: true, sidOverride: fresh });
              return;
            }
          }
          setErrorMessage(errorTextFor(kind, messages));
          setSending(false);
          setStreamingText(null);
          return;
        }
        if (isAborted()) return;
        if (
          full.trim().length === 0 &&
          result.products.length === 0 &&
          !result.clarifyingQuestion
        ) {
          setErrorMessage(messages.advisor.genericError);
        } else {
          const citations = unionCitations(result.products);
          setBubbles((prev) => [
            ...prev,
            {
              id: nextId('a'),
              role: 'assistant',
              text: full,
              citations,
              products: result.products,
              clarifying: result.clarifyingQuestion !== undefined,
            },
          ]);
          setPendingClarification(
            result.products.length === 0 && result.clarifyingQuestion !== undefined,
          );
        }
      } finally {
        if (!isAborted()) {
          setSending(false);
          setStreamingText(null);
        }
      }
    },
    [
      chat.sessionError,
      locale,
      messages,
      nextId,
      sending,
      sessionId,
      startFreshSession,
      storageKey,
    ],
  );

  const handleSubmit = useCallback(() => {
    void send(input);
  }, [input, send]);

  const handleRetry = useCallback(() => {
    if (openFailed) {
      setOpening(true);
      setOpenFailed(false);
      void startFreshSession().then((id) => {
        setOpenFailed(id === null);
        setOpening(false);
      });
      return;
    }
    void send(lastSentRef.current, { appendUser: bubbles[bubbles.length - 1]?.role !== 'user' });
  }, [bubbles, openFailed, send, startFreshSession]);

  const handleNewChat = useCallback(() => {
    if (startingNewChat || sending) return;
    abortRef.current?.abort();
    setStartingNewChat(true);
    setErrorMessage(null);
    void startFreshSession()
      .then((id) => {
        if (id === null) {
          setErrorMessage(chat.sessionError);
          return;
        }
        setBubbles([]);
        setPendingClarification(false);
        lastSentRef.current = '';
      })
      .finally(() => {
        setStartingNewChat(false);
      });
  }, [chat.sessionError, sending, startFreshSession, startingNewChat]);

  const handleAddToCart = useCallback(
    (productId: string): Promise<{ ok: true } | { ok: false }> =>
      addItem(productId).then((result) =>
        result.ok ? { ok: true as const } : { ok: false as const },
      ),
    [addItem],
  );

  const showStarters = bubbles.length === 0 && !sending && streamingText === null;
  const chips = showStarters ? chat.starters : pendingClarification ? chat.quickReplies : [];
  const chipsLabel = showStarters ? chat.startersLabel : chat.quickRepliesLabel;

  if (opening) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {messages.common.loading}
      </p>
    );
  }

  if (openFailed && sessionId === null) {
    return (
      <div role="alert" className="rounded-md border border-destructive px-3 py-2">
        <p className="text-sm text-foreground">{chat.sessionError}</p>
        <div className="mt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex h-8 items-center rounded-full border border-border bg-surface px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {messages.common.errorRetry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatWindow
      bubbles={bubbles}
      streamingText={streamingText}
      sending={sending}
      input={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      onNewChat={handleNewChat}
      startingNewChat={startingNewChat}
      errorMessage={errorMessage}
      onRetry={handleRetry}
      chips={chips}
      chipsLabel={chipsLabel}
      onChip={setInput}
      locale={locale}
      productHrefFor={(slug) => `/${locale}/productos/${encodeURIComponent(slug)}`}
      onAddToCart={handleAddToCart}
      messages={messages}
    />
  );
}
