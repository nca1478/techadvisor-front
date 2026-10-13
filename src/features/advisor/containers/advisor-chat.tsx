'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '@/features/cart/cart-context';
import {
  ADVISOR_CHAT_CLEARED_EVENT,
  asAdvisorCitation,
  asRecommendProduct,
  classifyAdvisorError,
  migrateLegacyChatSession,
  parseChatHistory,
  parseChatSessionList,
  readChatSessionHistory,
  removeChatSessionFromHistory,
  streamRecommendation,
  truncateSessionPreview,
  upsertChatSessionHistory,
  type AdvisorCitation,
  type ChatHistory,
  type ChatSession,
  type ChatSessionHistoryEntry,
  type RecommendProduct,
} from '@/lib/api/advisor';
import type { Dictionary } from '@/lib/i18n/index';
import { ChatWindow, type ChatBubble, type ChatHistoryOption } from '../components/chat-window';

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

function dedupeCitations(citations: AdvisorCitation[]): AdvisorCitation[] {
  // The backend persists message-level citations as a flatMap of per-product
  // citations, so the same `[n]` / chunkId can arrive repeated when several
  // products cite the same chunk. Dedupe by `n` (display number) and skip a
  // chunkId already shown under another number to keep React keys unique.
  const byNumber = new Map<number, AdvisorCitation>();
  const seenChunkIds = new Set<string>();
  for (const citation of citations) {
    if (byNumber.has(citation.n) || seenChunkIds.has(citation.chunkId)) continue;
    byNumber.set(citation.n, citation);
    seenChunkIds.add(citation.chunkId);
  }
  return [...byNumber.values()].sort((a, b) => a.n - b.n);
}

function historyToBubbles(history: ChatHistory): ChatBubble[] {
  return history.messages.map((message) =>
    message.role === 'USER'
      ? { id: message.id, role: 'user' as const, text: message.content }
      : {
          id: message.id,
          role: 'assistant' as const,
          text: message.content,
          citations: dedupeCitations(
            message.citations
              .map((citation) => asAdvisorCitation(citation))
              .filter((citation): citation is AdvisorCitation => citation !== null),
          ),
          products: message.products
            .map((product) => asRecommendProduct(product))
            .filter((product): product is RecommendProduct => product !== null),
        },
  );
}

function unionCitations(products: RecommendProduct[]): AdvisorCitation[] {
  return dedupeCitations(products.flatMap((product) => product.citations));
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

interface HistoryItem {
  id: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  preview?: string;
}

function mergeHistory(
  remote: ChatSession[] | null,
  localEntries: ChatSessionHistoryEntry[],
): HistoryItem[] {
  const previews = new Map(localEntries.map((entry) => [entry.id, entry.preview]));
  const merged: HistoryItem[] = [];
  if (remote) {
    for (const session of remote) {
      merged.push({ ...session, preview: previews.get(session.id) });
    }
  }
  const known = new Set(merged.map((item) => item.id));
  for (const entry of localEntries) {
    if (known.has(entry.id)) continue;
    merged.push({
      id: entry.id,
      messageCount: 0,
      createdAt: entry.updatedAt ?? '',
      updatedAt: entry.updatedAt ?? '',
      preview: entry.preview,
    });
  }
  return merged;
}

function moveHistoryToFront(items: HistoryItem[], sessionId: string): HistoryItem[] {
  const current = items.find((item) => item.id === sessionId);
  if (!current) return items;
  return [current, ...items.filter((item) => item.id !== sessionId)];
}

function formatHistoryLabel(item: HistoryItem, locale: string, fallback: string): string {
  let datePart = '';
  const dateSource = item.preview ? null : item.updatedAt || item.createdAt || null;
  if (dateSource) {
    const date = new Date(dateSource);
    if (!Number.isNaN(date.getTime())) {
      try {
        datePart = new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
      } catch {
        datePart = '';
      }
    }
  }
  const base = item.preview ?? (datePart ? `${fallback} · ${datePart}` : fallback);
  return item.messageCount > 0 ? `${base} (${String(item.messageCount)})` : base;
}

async function fetchSessionHistory(sessionId: string): Promise<ChatHistory | null> {
  try {
    const res = await fetch(`/api/advisor/sessions/${encodeURIComponent(sessionId)}`, {
      credentials: 'same-origin',
    });
    if (!res.ok) return null;
    const body: unknown = await res.json().catch(() => null);
    try {
      return parseChatHistory(body);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

async function fetchSessionList(): Promise<{
  status: 'ok' | 'unauthenticated' | 'failed';
  sessions: ChatSession[];
}> {
  try {
    const res = await fetch('/api/advisor/sessions', { credentials: 'same-origin' });
    // 401 = guest without a server list (browser history applies); 404 = list
    // route unknown (older BFF): both fall back to local history silently.
    if (res.status === 401 || res.status === 404)
      return { status: 'unauthenticated', sessions: [] };
    if (!res.ok) return { status: 'failed', sessions: [] };
    const body: unknown = await res.json().catch(() => null);
    try {
      return { status: 'ok', sessions: parseChatSessionList(body) };
    } catch {
      return { status: 'failed', sessions: [] };
    }
  } catch {
    return { status: 'failed', sessions: [] };
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [switchingSession, setSwitchingSession] = useState(false);
  const [opening, setOpening] = useState(true);
  const [openFailed, setOpenFailed] = useState(false);
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingClarification, setPendingClarification] = useState(false);
  const [startingNewChat, setStartingNewChat] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);
  const lastSentRef = useRef('');
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const nextId = useCallback((prefix: string): string => {
    idRef.current += 1;
    return `${prefix}-${String(Date.now())}-${String(idRef.current)}`;
  }, []);

  const trackSession = useCallback(
    (id: string, preview?: string): void => {
      const now = new Date().toISOString();
      upsertChatSessionHistory(
        locale,
        preview ? { id, preview, updatedAt: now } : { id, updatedAt: now },
      );
      setSessions((prev) => {
        const existing = prev.find((item) => item.id === id);
        if (existing) {
          return moveHistoryToFront(
            prev.map((item) =>
              item.id === id ? { ...item, preview: preview ?? item.preview, updatedAt: now } : item,
            ),
            id,
          );
        }
        return [{ id, messageCount: 0, createdAt: now, updatedAt: now, preview }, ...prev];
      });
    },
    [locale],
  );

  const startFreshSession = useCallback(async (): Promise<string | null> => {
    const id = await openSession();
    if (id !== null) {
      trackSession(id);
      setSessionId(id);
    }
    return id;
  }, [trackSession]);

  // Mount: merge the server list (authenticated) with the browser history
  // (guests included), then restore the most recent reachable session.
  useEffect(() => {
    // Per-mount flag (StrictMode double-mount safe: a shared ref would let
    // the first mount's in-flight init survive its cleanup and duplicate
    // sessions). Reads go through the typed reader because an early
    // `if (cancelled) return;` would otherwise narrow every later read in
    // this flow to `false` for the linter.
    let cancelled = false;
    const isCancelled = (): boolean => cancelled;
    async function init(): Promise<void> {
      const legacy = migrateLegacyChatSession(locale);
      const localEntries = readChatSessionHistory(locale);
      const list = await fetchSessionList();
      if (isCancelled()) return;
      const merged = mergeHistory(list.status === 'ok' ? list.sessions : null, localEntries);
      if (list.status === 'failed' && !isCancelled()) {
        setErrorMessage(chat.historyListError);
      }
      const candidates: string[] = [];
      for (const id of [
        legacy,
        ...localEntries.map((entry) => entry.id),
        ...merged.map((item) => item.id),
      ]) {
        if (id && !candidates.includes(id)) candidates.push(id);
      }
      for (const candidate of candidates) {
        if (isCancelled()) return;
        const history = await fetchSessionHistory(candidate);
        if (isCancelled()) return;
        if (history) {
          const preview = history.messages.find((message) => message.role === 'USER')?.content;
          upsertChatSessionHistory(
            locale,
            preview
              ? {
                  id: candidate,
                  preview: truncateSessionPreview(preview),
                  updatedAt: history.updatedAt,
                }
              : { id: candidate, updatedAt: history.updatedAt },
          );
          const refreshed = readChatSessionHistory(locale);
          const withPreview = new Map(refreshed.map((entry) => [entry.id, entry.preview]));
          setSessions(
            moveHistoryToFront(
              mergeHistory(list.status === 'ok' ? list.sessions : null, refreshed).map((item) => ({
                ...item,
                messageCount: item.id === candidate ? history.messageCount : item.messageCount,
                updatedAt: item.id === candidate ? history.updatedAt : item.updatedAt,
                preview: withPreview.get(item.id) ?? item.preview,
              })),
              candidate,
            ),
          );
          setSessionId(candidate);
          setBubbles(historyToBubbles(history));
          setOpening(false);
          setHistoryLoading(false);
          return;
        }
        // Unreachable (purged or foreign): drop it from the browser history.
        removeChatSessionFromHistory(locale, candidate);
      }
      if (isCancelled()) return;
      setSessions(merged);
      const id = await openSession();
      if (isCancelled()) return;
      if (id !== null) {
        trackSession(id);
        setSessionId(id);
        setSessions((prev) =>
          prev.some((item) => item.id === id) ? moveHistoryToFront(prev, id) : prev,
        );
        if (list.status === 'failed') setErrorMessage(chat.historyListError);
        else setErrorMessage(null);
      } else {
        setOpenFailed(true);
      }
      setOpening(false);
      setHistoryLoading(false);
    }
    void init();
    return () => {
      cancelled = true;
    };
    // Runs once per locale mount; session setters are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Abort any in-flight stream on unmount.
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  // Logout (or any `clearAdvisorChatState()` caller): drop the in-memory
  // conversation at once and open a fresh guest session, so the previous
  // account's bubbles are never shown. The localStorage slots are already
  // cleared by the time this event fires.
  useEffect(() => {
    const handleCleared = (): void => {
      abortRef.current?.abort();
      lastSentRef.current = '';
      setBubbles([]);
      setSessions([]);
      setSessionId(null);
      setInput('');
      setStreamingText(null);
      setSending(false);
      setErrorMessage(null);
      setPendingClarification(false);
      setConfirmingDelete(false);
      setSwitchingSession(false);
      setDeletingSession(false);
      setHistoryLoading(false);
      setOpenFailed(false);
      setOpening(true);
      void startFreshSession().then((id) => {
        setOpenFailed(id === null);
        setOpening(false);
      });
    };
    window.addEventListener(ADVISOR_CHAT_CLEARED_EVENT, handleCleared);
    return () => {
      window.removeEventListener(ADVISOR_CHAT_CLEARED_EVENT, handleCleared);
    };
  }, [startFreshSession]);

  const send = useCallback(
    async (
      text: string,
      options: { appendUser?: boolean; rotated?: boolean; sidOverride?: string } = {},
    ): Promise<void> => {
      const content = text.trim();
      if (content.length === 0 || sending || deletingSession) return;
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
            if (sid) removeChatSessionFromHistory(locale, sid);
            setSessions((prev) => prev.filter((item) => item.id !== sid));
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
          // Keep the history entry fresh: first user message becomes the
          // selector preview, and the turn count grows optimistically.
          const now = new Date().toISOString();
          setSessions((prev) => {
            const existing = prev.find((item) => item.id === sid);
            const preview = existing?.preview ?? truncateSessionPreview(content);
            if (existing) {
              return moveHistoryToFront(
                prev.map((item) =>
                  item.id === sid
                    ? {
                        ...item,
                        preview,
                        messageCount: item.messageCount + 2,
                        updatedAt: now,
                      }
                    : item,
                ),
                sid,
              );
            }
            return [{ id: sid, messageCount: 2, createdAt: now, updatedAt: now, preview }, ...prev];
          });
          upsertChatSessionHistory(locale, {
            id: sid,
            preview: truncateSessionPreview(
              sessions.find((item) => item.id === sid)?.preview ?? content,
            ),
            updatedAt: now,
          });
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
      deletingSession,
      locale,
      messages,
      nextId,
      sending,
      sessionId,
      sessions,
      startFreshSession,
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

  const handleSelectSession = useCallback(
    async (id: string): Promise<void> => {
      if (id === sessionId || sending || startingNewChat || switchingSession || deletingSession) {
        return;
      }
      abortRef.current?.abort();
      setSwitchingSession(true);
      setConfirmingDelete(false);
      setErrorMessage(null);
      const history = await fetchSessionHistory(id);
      if (history) {
        const preview = history.messages.find((message) => message.role === 'USER')?.content;
        upsertChatSessionHistory(
          locale,
          preview
            ? { id, preview: truncateSessionPreview(preview), updatedAt: history.updatedAt }
            : { id, updatedAt: history.updatedAt },
        );
        setSessions((prev) => {
          const existing = prev.find((item) => item.id === id);
          if (existing) {
            return moveHistoryToFront(
              prev.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      preview: preview ? truncateSessionPreview(preview) : item.preview,
                      messageCount: history.messageCount,
                      updatedAt: history.updatedAt,
                    }
                  : item,
              ),
              id,
            );
          }
          return [
            {
              id,
              messageCount: history.messageCount,
              createdAt: history.createdAt,
              updatedAt: history.updatedAt,
              preview: preview ? truncateSessionPreview(preview) : undefined,
            },
            ...prev,
          ];
        });
        setSessionId(id);
        setBubbles(historyToBubbles(history));
        setPendingClarification(false);
        lastSentRef.current = '';
        setInput('');
      } else {
        // Purged or never owned: drop it so the selector never strands the user.
        removeChatSessionFromHistory(locale, id);
        setSessions((prev) => prev.filter((item) => item.id !== id));
        setErrorMessage(chat.historyError);
      }
      setSwitchingSession(false);
    },
    [
      chat.historyError,
      deletingSession,
      locale,
      sending,
      sessionId,
      startingNewChat,
      switchingSession,
    ],
  );

  const handleNewChat = useCallback(() => {
    if (startingNewChat || sending || switchingSession || deletingSession) return;
    abortRef.current?.abort();
    setStartingNewChat(true);
    setConfirmingDelete(false);
    setErrorMessage(null);
    // The previous session stays in `sessions` + browser history: creating a
    // new one never deletes the current conversation, it just stops showing it.
    void startFreshSession()
      .then((id) => {
        if (id === null) {
          setErrorMessage(chat.sessionError);
          return;
        }
        setSessions((prev) =>
          prev.some((item) => item.id === id) ? moveHistoryToFront(prev, id) : prev,
        );
        setBubbles([]);
        setPendingClarification(false);
        lastSentRef.current = '';
      })
      .finally(() => {
        setStartingNewChat(false);
      });
  }, [
    chat.sessionError,
    deletingSession,
    sending,
    startFreshSession,
    startingNewChat,
    switchingSession,
  ]);

  const handleDeleteRequest = useCallback(() => {
    if (sending || startingNewChat || switchingSession || deletingSession || sessionId === null) {
      return;
    }
    setErrorMessage(null);
    setConfirmingDelete(true);
  }, [deletingSession, sending, sessionId, startingNewChat, switchingSession]);

  const handleDeleteCancel = useCallback(() => {
    setConfirmingDelete(false);
  }, []);

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    const id = sessionId;
    if (id === null || deletingSession || sending) return;
    abortRef.current?.abort();
    setDeletingSession(true);
    setConfirmingDelete(false);
    setErrorMessage(null);
    let gone = false;
    try {
      const res = await fetch(`/api/advisor/sessions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      // 404 means it is already gone server-side (purged, or deleted in
      // another tab): the local outcome is the same — drop it everywhere.
      gone = res.ok || res.status === 404;
    } catch {
      gone = false;
    }
    if (!gone) {
      setErrorMessage(chat.deleteError);
      setDeletingSession(false);
      return;
    }
    removeChatSessionFromHistory(locale, id);
    const remaining = sessions.filter((item) => item.id !== id);
    // Show the most recent surviving conversation (skipping purged ones);
    // when none survives, open a blank one so the composer keeps working.
    let activated: { id: string; bubbles: ChatBubble[]; history: ChatHistory } | null = null;
    const dropped: string[] = [];
    for (const candidate of remaining) {
      const history = await fetchSessionHistory(candidate.id);
      if (history) {
        activated = { id: candidate.id, bubbles: historyToBubbles(history), history };
        break;
      }
      dropped.push(candidate.id);
      removeChatSessionFromHistory(locale, candidate.id);
    }
    const alive = remaining.filter((item) => !dropped.includes(item.id));
    if (activated) {
      const { id: nextId, bubbles: nextBubbles, history } = activated;
      const survivor = alive.find((item) => item.id === nextId);
      upsertChatSessionHistory(
        locale,
        survivor?.preview
          ? { id: nextId, preview: survivor.preview, updatedAt: history.updatedAt }
          : { id: nextId, updatedAt: history.updatedAt },
      );
      setSessions(
        moveHistoryToFront(
          alive.map((item) =>
            item.id === nextId
              ? { ...item, messageCount: history.messageCount, updatedAt: history.updatedAt }
              : item,
          ),
          nextId,
        ),
      );
      setSessionId(nextId);
      setBubbles(nextBubbles);
    } else {
      setSessions([]);
      setSessionId(null);
      setBubbles([]);
      const fresh = await startFreshSession();
      if (fresh === null) {
        setErrorMessage(chat.sessionError);
      }
    }
    setPendingClarification(false);
    lastSentRef.current = '';
    setInput('');
    setDeletingSession(false);
  }, [
    chat.deleteError,
    chat.sessionError,
    deletingSession,
    locale,
    sending,
    sessionId,
    sessions,
    startFreshSession,
  ]);

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
  const historyOptions: ChatHistoryOption[] = sessions.map((item) => ({
    id: item.id,
    label: formatHistoryLabel(item, locale, chat.conversationFallback),
  }));

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
      historyOptions={historyOptions}
      currentSessionId={sessionId}
      historyLoading={historyLoading}
      switchingSession={switchingSession}
      onSelectSession={(id) => {
        void handleSelectSession(id);
      }}
      deleteConfirming={confirmingDelete}
      deletingSession={deletingSession}
      onDeleteRequest={handleDeleteRequest}
      onDeleteConfirm={() => {
        void handleDeleteConfirm();
      }}
      onDeleteCancel={handleDeleteCancel}
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
