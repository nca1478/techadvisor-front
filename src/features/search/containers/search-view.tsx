'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { CatalogEmpty, CatalogError } from '@/features/catalog/components/catalog-states';
import type { CatalogCategory } from '@/lib/api/catalog';
import type { SearchResponse } from '@/lib/api/search';
import type { Dictionary } from '@/lib/i18n/index';
import { currencyFractionDigits } from '@/lib/money/format';
import { SearchFilters } from '../components/search-filters';
import { SearchResults } from '../components/search-results';

export interface SearchViewProps {
  initialData: SearchResponse | null;
  loadError: boolean;
  categories: CatalogCategory[];
  locale: string;
  currency: string;
  messages: Dictionary;
  query: string;
  initialCategory: string;
  /** Current max price in minor units (URL), if any. */
  initialMaxPriceMinor: number | null;
}

function formatTemplate(template: string, replacements: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

function minorToInput(minor: number | null, currency: string): string {
  if (minor === null) return '';
  return String(minor / 10 ** currencyFractionDigits(currency));
}

/**
 * Results view: filters rewrite the URL (server re-fetches on navigation),
 * so a reload or share preserves the search. Price input is in display
 * units and converted to minor units with the currency exponent.
 */
export function SearchView({
  initialData,
  loadError,
  categories,
  locale,
  currency,
  messages,
  query,
  initialCategory,
  initialMaxPriceMinor,
}: SearchViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [queryInput, setQueryInput] = useState(query);
  const [category, setCategory] = useState(initialCategory);
  const [maxPriceInput, setMaxPriceInput] = useState(minorToInput(initialMaxPriceMinor, currency));
  const [maxPriceError, setMaxPriceError] = useState<string | undefined>(undefined);

  function apply(nextQuery: string, nextCategory: string, nextMaxPriceMinor: number | null) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedQuery = nextQuery.trim();
    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    } else {
      params.delete('q');
    }
    if (nextCategory) {
      params.set('category', nextCategory);
    } else {
      params.delete('category');
    }
    if (nextMaxPriceMinor !== null) {
      params.set('maxPrice', String(nextMaxPriceMinor));
    } else {
      params.delete('maxPrice');
    }
    const url = `${pathname}?${params.toString()}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  function handleApply() {
    const trimmed = maxPriceInput.trim();
    if (trimmed === '') {
      setMaxPriceError(undefined);
      apply(queryInput, category, null);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setMaxPriceError(messages.search.maxPriceInvalid);
      return;
    }
    setMaxPriceError(undefined);
    apply(queryInput, category, Math.round(parsed * 10 ** currencyFractionDigits(currency)));
  }

  function handleClear() {
    setQueryInput('');
    setCategory('');
    setMaxPriceInput('');
    setMaxPriceError(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('category');
    params.delete('maxPrice');
    const url = `${pathname}?${params.toString()}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  return (
    <Container>
      <Section spacing="tight">
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{messages.search.title}</Heading>
            <Text tone="muted">{messages.search.subtitle}</Text>
          </Stack>

          <SearchFilters
            values={{ query: queryInput, category, maxPriceInput }}
            categories={categories}
            messages={messages.search}
            maxPriceError={maxPriceError}
            onChange={(next) => {
              setQueryInput(next.query);
              setCategory(next.category);
              setMaxPriceInput(next.maxPriceInput);
            }}
            onApply={handleApply}
            onClear={handleClear}
          />

          {query.trim() === '' ? (
            <CatalogEmpty title={messages.common.emptyTitle} message={messages.search.subtitle} />
          ) : loadError || initialData === null ? (
            <CatalogError
              title={messages.common.errorTitle}
              message={messages.search.loadError}
              retryLabel={messages.common.errorRetry}
              onRetry={() => {
                router.refresh();
              }}
            />
          ) : (
            <div
              aria-busy={isPending || undefined}
              className={isPending ? 'opacity-60' : undefined}
            >
              <Text variant="small" tone="muted" role="status">
                {formatTemplate(messages.search.resultsFor, {
                  count: String(initialData.results.length),
                  query: initialData.query,
                })}
              </Text>
              {initialData.degraded && (
                <Card>
                  <Text variant="small" tone="muted" role="status" as="p">
                    {messages.search.degradedNotice}
                  </Text>
                </Card>
              )}
              {initialData.results.length === 0 ? (
                <CatalogEmpty title={messages.common.emptyTitle} message={messages.search.empty} />
              ) : (
                <SearchResults
                  results={initialData.results}
                  locale={locale}
                  currency={initialData.currency}
                  catalogMessages={messages.catalog}
                  detailHrefFor={(slug) => `/${locale}/productos/${slug}`}
                />
              )}
            </div>
          )}
        </Stack>
      </Section>
    </Container>
  );
}
