'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { createApiClient } from '@/lib/api/client';
import { createSearchApi, type SearchProduct } from '@/lib/api/search';
import type { Dictionary } from '@/lib/i18n/index';
import { useDebouncedValue } from '../hooks/use-debounced-value';

export interface SearchBarProps {
  locale: string;
  messages: Dictionary['search'];
  /** Initial text (e.g. when rendered on the results page). */
  initialQuery?: string;
  autoFocus?: boolean;
}

const SUGGESTION_LIMIT = 5;
const MIN_SUGGEST_CHARS = 2;

/**
 * Header search bar: debounced suggestions (same `/search` endpoint,
 * `limit=5`) in a dropdown, Enter navigates to the localized results page.
 * Suggestion fetches are cancellable and stale responses are ignored.
 */
export function SearchBar({
  locale,
  messages,
  initialQuery = '',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchProduct[]>([]);
  // Last debounced query settled by the suggestion fetch (success or
  // failure). `loading` and `open` derive from it, so the fetch effect never
  // sets state synchronously — results land only in async callbacks.
  const [settledQuery, setSettledQuery] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const debounced = useDebouncedValue(query.trim());
  const requestId = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const suggestible = debounced.length >= MIN_SUGGEST_CHARS;
  const loading = suggestible && settledQuery !== debounced;
  const open = suggestible && !dismissed;

  useEffect(() => {
    if (!suggestible) {
      return;
    }
    const id = (requestId.current += 1);
    const controller = new AbortController();
    // Fire-and-forget subscription: results land via the callbacks below.
    void createSearchApi(createApiClient())
      .search({ q: debounced, locale, limit: SUGGESTION_LIMIT })
      .then((response) => {
        if (requestId.current !== id || controller.signal.aborted) return;
        setSuggestions(response.results.map((result) => result.product));
      })
      .catch(() => {
        if (requestId.current !== id || controller.signal.aborted) return;
        setSuggestions([]);
      })
      .finally(() => {
        if (requestId.current === id && !controller.signal.aborted) {
          setSettledQuery(debounced);
        }
      });
    return () => {
      controller.abort();
    };
  }, [debounced, locale, suggestible]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setDismissed(true);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  function submit() {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    setDismissed(true);
    router.push(`/${locale}/buscar?q=${encodeURIComponent(trimmed)}`);
  }

  const listboxId = 'header-search-suggestions';

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Input
          label={messages.label}
          labelHidden
          name="header-search"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          placeholder={messages.placeholder}
          value={query}
          autoFocus={autoFocus}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setDismissed(false);
            if (next.trim().length < MIN_SUGGEST_CHARS) {
              // Clear immediately (and invalidate in-flight suggestion
              // fetches) instead of waiting for the debounced value.
              requestId.current += 1;
              setSuggestions([]);
              setSettledQuery(next.trim());
            }
          }}
          onFocus={() => {
            setDismissed(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setDismissed(true);
          }}
        />
      </form>
      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-1 rounded-md border border-border bg-surface shadow-lg">
          {loading ? (
            <Text variant="small" tone="muted" as="p" className="px-3 py-2">
              {messages.suggestionsLoading}
            </Text>
          ) : suggestions.length === 0 ? (
            <Text variant="small" tone="muted" as="p" className="px-3 py-2">
              {messages.noSuggestions}
            </Text>
          ) : (
            <ul id={listboxId} role="listbox" aria-label={messages.suggestionsLabel}>
              {suggestions.map((product) => (
                <li key={product.id} role="option" aria-selected="false">
                  <a
                    href={`/${locale}/productos/${product.slug}`}
                    className="block truncate px-3 py-2 text-sm text-foreground hover:bg-background"
                    onClick={() => {
                      setDismissed(true);
                    }}
                  >
                    {product.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <Stack direction="horizontal" justify="end" className="border-t border-border px-3 py-2">
            <Button
              variant="link"
              onClick={() => {
                submit();
              }}
            >
              {messages.viewAllResults}
            </Button>
          </Stack>
        </div>
      )}
    </div>
  );
}
