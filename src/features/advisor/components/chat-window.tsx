'use client';

import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { AdvisorCitation, RecommendProduct } from '@/lib/api/advisor';
import type { Dictionary } from '@/lib/i18n/index';
import { AdvisorAnswer } from './advisor-answer';
import { ProductCard } from './product-card';

export interface ChatBubble {
  id: string;
  role: 'user' | 'assistant';
  /** Plain text — never rendered as HTML. */
  text: string;
  citations?: AdvisorCitation[];
  products?: RecommendProduct[];
  /** True when the backend asked a follow-up instead of recommending. */
  clarifying?: boolean;
}

export interface ChatHistoryOption {
  id: string;
  label: string;
}

export interface ChatWindowProps {
  bubbles: ChatBubble[];
  /** Live assistant text while streaming; null when idle. */
  streamingText: string | null;
  sending: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onNewChat: () => void;
  startingNewChat: boolean;
  /** Saved sessions for the history selector (empty = none yet). */
  historyOptions?: ChatHistoryOption[];
  currentSessionId?: string | null;
  historyLoading?: boolean;
  switchingSession?: boolean;
  onSelectSession?: (sessionId: string) => void;
  errorMessage: string | null;
  onRetry: () => void;
  chips: string[];
  chipsLabel: string;
  onChip: (text: string) => void;
  locale: string;
  productHrefFor: (slug: string) => string;
  onAddToCart: (productId: string) => Promise<{ ok: true } | { ok: false }>;
  messages: Dictionary;
}

/**
 * Presentational chat: message log (`role="log"`), streaming text, typing
 * indicator (`role="status"`), quick-reply chips, error alert with retry,
 * composer form and the privacy note. No fetching here.
 */
export function ChatWindow({
  bubbles,
  streamingText,
  sending,
  input,
  onInputChange,
  onSubmit,
  onNewChat,
  startingNewChat,
  historyOptions = [],
  currentSessionId = null,
  historyLoading = false,
  switchingSession = false,
  onSelectSession,
  errorMessage,
  onRetry,
  chips,
  chipsLabel,
  onChip,
  locale,
  productHrefFor,
  onAddToCart,
  messages,
}: ChatWindowProps) {
  const chat = messages.chat;
  const logRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const busy = sending || streamingText !== null;

  useEffect(() => {
    const log = logRef.current;
    if (log) {
      log.scrollTop = log.scrollHeight;
    }
  }, [bubbles, streamingText]);

  const handleChip = (chip: string) => {
    onChip(chip);
    // Keep the composer focused so keyboard users can review and send.
    requestAnimationFrame(() => {
      formRef.current?.querySelector('input')?.focus();
    });
  };

  const handleChipClick = (chip: string) => () => {
    handleChip(chip);
  };

  const historyBusy = sending || startingNewChat || switchingSession;
  const showHistory = historyLoading || historyOptions.length > 0 || currentSessionId !== null;

  return (
    <Stack gap="md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Stack gap="sm">
          <Text variant="small" tone="muted">
            {chat.subtitle}
          </Text>
        </Stack>
        <Button
          variant="secondary"
          size="sm"
          loading={startingNewChat}
          disabled={startingNewChat || sending}
          onClick={onNewChat}
        >
          {chat.newChat}
        </Button>
      </div>

      {showHistory ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="advisor-history" className="text-xs font-medium text-muted-foreground">
            {chat.historyLabel}
          </label>
          {historyLoading ? (
            <Text variant="small" tone="muted" role="status">
              {chat.historyLoading}
            </Text>
          ) : historyOptions.length === 0 ? (
            <Text variant="small" tone="muted">
              {chat.historyEmpty}
            </Text>
          ) : (
            <select
              id="advisor-history"
              className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={currentSessionId ?? ''}
              disabled={historyBusy}
              onChange={(event) => {
                if (event.target.value) onSelectSession?.(event.target.value);
              }}
            >
              {historyOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : null}

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={chat.logLabel}
        className="flex max-h-[60dvh] min-h-[40dvh] flex-col gap-3 overflow-y-auto rounded-md border border-border bg-background p-3"
      >
        {bubbles.length === 0 && streamingText === null ? (
          <Text variant="small" tone="muted">
            {chat.inputPlaceholder}
          </Text>
        ) : null}
        {bubbles.map((bubble) =>
          bubble.role === 'user' ? (
            <div key={bubble.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-md rounded-br-none bg-primary px-3 py-2 text-primary-foreground">
                <span className="sr-only">{`${chat.userLabel}: `}</span>
                <span className="text-sm leading-relaxed">{bubble.text}</span>
              </div>
            </div>
          ) : (
            <div key={bubble.id} className="flex justify-start">
              <div className="flex max-w-[95%] flex-col gap-2 rounded-md rounded-bl-none border border-border bg-surface px-3 py-2 sm:max-w-[85%]">
                <span className="sr-only">{`${chat.assistantLabel}: `}</span>
                {bubble.clarifying ? <Badge tone="warning">{chat.clarificationBadge}</Badge> : null}
                {bubble.citations && bubble.citations.length > 0 ? (
                  <AdvisorAnswer
                    answer={bubble.text}
                    citations={bubble.citations}
                    locale={locale}
                    sourceLabel={messages.advisor.sourceLabel}
                    showSnippetLabel={messages.advisor.showSnippet}
                    hideSnippetLabel={messages.advisor.hideSnippet}
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-foreground">{bubble.text}</p>
                )}
                {bubble.products && bubble.products.length > 0 ? (
                  <ul className="flex flex-col gap-2" aria-label={messages.catalog.title}>
                    {bubble.products.map((product) => (
                      <li key={product.productId}>
                        <ProductCard
                          product={product}
                          locale={locale}
                          productHref={productHrefFor(product.slug)}
                          messages={{
                            addToCart: chat.addToCart,
                            addedToCart: chat.addedToCart,
                            addToCartError: chat.addToCartError,
                            viewProduct: chat.viewProduct,
                            inStock: chat.inStock,
                            outOfStock: chat.outOfStock,
                            sourceLabel: messages.advisor.sourceLabel,
                            showSnippet: messages.advisor.showSnippet,
                            hideSnippet: messages.advisor.hideSnippet,
                          }}
                          onAdd={onAddToCart}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ),
        )}
        {streamingText !== null ? (
          <div className="flex justify-start">
            <div className="max-w-[95%] rounded-md rounded-bl-none border border-border bg-surface px-3 py-2 sm:max-w-[85%]">
              <span className="sr-only">{`${chat.assistantLabel}: `}</span>
              <p aria-hidden="true" className="text-sm leading-relaxed text-foreground">
                {streamingText}
                <span aria-hidden="true" className="animate-pulse">
                  {'▍'}
                </span>
              </p>
            </div>
          </div>
        ) : null}
        {sending && streamingText === null ? (
          <Text variant="small" tone="muted" role="status">
            {chat.typing}
          </Text>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <div>
          <Text variant="small" tone="muted" className="mb-2 font-medium" as="p">
            {chipsLabel}
          </Text>
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={handleChipClick(chip)}
                >
                  {chip}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {errorMessage !== null ? (
        <div role="alert" className="rounded-md border border-destructive px-3 py-2">
          <Text variant="small">{errorMessage}</Text>
          <div className="mt-2">
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {messages.advisor.retry}
            </Button>
          </div>
        </div>
      ) : null}

      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label={chat.inputLabel}
            name="chat-message"
            placeholder={chat.inputPlaceholder}
            value={input}
            maxLength={4000}
            autoComplete="off"
            disabled={sending}
            onChange={(event) => {
              onInputChange(event.target.value);
            }}
          />
        </div>
        <Button type="submit" loading={sending} disabled={sending || input.trim().length === 0}>
          {chat.send}
        </Button>
      </form>

      <Text variant="caption" tone="muted">
        {messages.advisor.disclaimer}
      </Text>
      <Text variant="caption" tone="muted">
        {messages.advisor.privacyNote}
      </Text>
    </Stack>
  );
}
