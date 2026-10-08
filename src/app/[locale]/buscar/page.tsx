import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CatalogLoading } from '@/features/catalog/components/catalog-states';
import { firstParam, resolveCurrency } from '@/features/catalog/hooks/server-params';
import { SearchView } from '@/features/search/containers/search-view';
import { createApiClient } from '@/lib/api/client';
import { createCatalogApi } from '@/lib/api/catalog';
import { getPublicConfig } from '@/lib/api/index';
import { createSearchApi } from '@/lib/api/search';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type QueryParams = Record<string, string | string[] | undefined>;

interface SearchPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

function resolveLocale(value: unknown) {
  const locale = (value as { locale?: unknown } | null)?.locale;
  return isLocale(locale) ? locale : null;
}

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const locale = resolveLocale(await params);
  if (locale === null) return {};
  const messages = await getDictionary(locale);
  const languages = Object.fromEntries(LOCALES.map((code) => [code, `/${code}/buscar`]));
  const title = `${messages.search.title} — ${messages.common.techAdvisor}`;
  return {
    title,
    description: messages.search.subtitle,
    alternates: { canonical: `/${locale}/buscar`, languages },
  };
}

/**
 * Localized natural-language results page: `q`/`category`/`maxPrice` come
 * from the URL so searches survive reloads and shares. Server-fetches the
 * search response (price/stock/images from SQL) plus categories; the client
 * view only rewrites the URL (fetching happens again on navigation).
 */
export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const locale = resolveLocale(await params);
  if (locale === null) {
    notFound();
  }
  const query = ((await searchParams) ?? {}) as QueryParams;
  const messages = await getDictionary(locale);
  const client = createApiClient();
  const search = createSearchApi(client);
  const catalog = createCatalogApi(client);

  const q = firstParam(query, 'q');
  const category = firstParam(query, 'category');
  const rawMaxPrice = firstParam(query, 'maxPrice');
  const parsedMaxPrice = rawMaxPrice === '' ? null : Number(rawMaxPrice);
  const maxPrice =
    parsedMaxPrice !== null && Number.isInteger(parsedMaxPrice) && parsedMaxPrice >= 0
      ? parsedMaxPrice
      : null;

  let currency = 'USD';
  try {
    const config = await getPublicConfig(client);
    currency = resolveCurrency(query, config);
  } catch {
    // Fall through with the base fallback; the view shows its error state below.
  }

  const [searchResult, categoriesResult] = await Promise.allSettled([
    q === ''
      ? Promise.resolve(null)
      : search.search({
          q,
          category: category === '' ? undefined : category,
          maxPrice: maxPrice ?? undefined,
          currency,
          locale,
        }),
    catalog.listCategories(locale),
  ]);

  return (
    <Suspense fallback={<CatalogLoading message={messages.common.loading} />}>
      <SearchView
        initialData={searchResult.status === 'fulfilled' ? searchResult.value : null}
        loadError={q !== '' && searchResult.status === 'rejected'}
        categories={categoriesResult.status === 'fulfilled' ? categoriesResult.value : []}
        locale={locale}
        currency={currency}
        messages={messages}
        query={q}
        initialCategory={category}
        initialMaxPriceMinor={maxPrice}
      />
    </Suspense>
  );
}
