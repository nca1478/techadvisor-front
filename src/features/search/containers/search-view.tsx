'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Disclosure } from '@/components/ui/disclosure';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { CatalogEmpty, CatalogError } from '@/features/catalog/components/catalog-states';
import type { CatalogBrand, CatalogCategory, ProductSort } from '@/lib/api/catalog';
import type { SearchResponse } from '@/lib/api/search';
import type { Dictionary } from '@/lib/i18n/index';
import { currencyFractionDigits } from '@/lib/money/format';
import { SearchFilters } from '../components/search-filters';
import { SearchResults } from '../components/search-results';

export interface SearchViewProps {
  initialData: SearchResponse | null;
  loadError: boolean;
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  locale: string;
  currency: string;
  messages: Dictionary;
  query: string;
  initialCategory: string;
  initialBrand: string;
  initialSort: ProductSort | '';
  initialInStockOnly: boolean;
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

interface ApplyFilters {
  query: string;
  category: string;
  brand: string;
  sort: ProductSort | '';
  maxPriceMinor: number | null;
  inStockOnly: boolean;
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
  brands,
  locale,
  currency,
  messages,
  query,
  initialCategory,
  initialBrand,
  initialSort,
  initialInStockOnly,
  initialMaxPriceMinor,
}: SearchViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [queryInput, setQueryInput] = useState(query);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [sort, setSort] = useState<ProductSort | ''>(initialSort);
  const [inStockOnly, setInStockOnly] = useState(initialInStockOnly);
  const [maxPriceInput, setMaxPriceInput] = useState(minorToInput(initialMaxPriceMinor, currency));
  const [maxPriceError, setMaxPriceError] = useState<string | undefined>(undefined);

  function apply(next: ApplyFilters) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedQuery = next.query.trim();
    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    } else {
      params.delete('q');
    }
    if (next.category) {
      params.set('category', next.category);
    } else {
      params.delete('category');
    }
    if (next.brand) {
      params.set('brand', next.brand);
    } else {
      params.delete('brand');
    }
    if (next.sort) {
      params.set('sort', next.sort);
    } else {
      params.delete('sort');
    }
    if (next.inStockOnly) {
      params.set('inStock', '1');
    } else {
      params.delete('inStock');
    }
    if (next.maxPriceMinor !== null) {
      params.set('maxPrice', String(next.maxPriceMinor));
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
      apply({ query: queryInput, category, brand, sort, maxPriceMinor: null, inStockOnly });
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setMaxPriceError(messages.search.maxPriceInvalid);
      return;
    }
    setMaxPriceError(undefined);
    apply({
      query: queryInput,
      category,
      brand,
      sort,
      maxPriceMinor: Math.round(parsed * 10 ** currencyFractionDigits(currency)),
      inStockOnly,
    });
  }

  function handleClear() {
    setQueryInput('');
    setCategory('');
    setBrand('');
    setSort('');
    setInStockOnly(false);
    setMaxPriceInput('');
    setMaxPriceError(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('category');
    params.delete('brand');
    params.delete('sort');
    params.delete('inStock');
    params.delete('maxPrice');
    const url = `${pathname}?${params.toString()}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  const activeFilterCount =
    (queryInput.trim() !== '' ? 1 : 0) +
    (category !== '' ? 1 : 0) +
    (brand !== '' ? 1 : 0) +
    (sort !== '' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPriceInput.trim() !== '' ? 1 : 0);

  return (
    <Container>
      <Section spacing="tight">
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={1}>{messages.search.title}</Heading>
            <Text tone="muted">{messages.search.subtitle}</Text>
          </Stack>

          <Disclosure title={messages.search.filtersTitle} count={activeFilterCount}>
            <SearchFilters
              values={{ query: queryInput, category, brand, sort, maxPriceInput, inStockOnly }}
              categories={categories}
              brands={brands}
              messages={messages.search}
              maxPriceError={maxPriceError}
              onChange={(next) => {
                setQueryInput(next.query);
                setCategory(next.category);
                setBrand(next.brand);
                setSort(next.sort);
                setMaxPriceInput(next.maxPriceInput);
                setInStockOnly(next.inStockOnly);
              }}
              onApply={handleApply}
              onClear={handleClear}
            />
          </Disclosure>

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
