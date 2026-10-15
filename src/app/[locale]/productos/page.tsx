import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ListingSkeleton } from '@/features/catalog/components/listing-skeleton';
import { ProductListView } from '@/features/catalog/containers/product-list-view';
import { firstParam, resolveCurrency } from '@/features/catalog/hooks/server-params';
import { createApiClient } from '@/lib/api/client';
import { createCatalogApi, type ProductSort } from '@/lib/api/catalog';
import { getPublicConfig } from '@/lib/api/index';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type QueryParams = Record<string, string | string[] | undefined>;

interface ListingPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

function resolveLocale(value: unknown) {
  const locale = (value as { locale?: unknown } | null)?.locale;
  return isLocale(locale) ? locale : null;
}

const SORTS: ReadonlyArray<ProductSort> = [
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
  'newest',
];

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const locale = resolveLocale(await params);
  if (locale === null) return {};
  const messages = await getDictionary(locale);
  const languages = Object.fromEntries(LOCALES.map((code) => [code, `/${code}/productos`]));
  const title = `${messages.catalog.title} — ${messages.common.techAdvisor}`;
  const description = messages.catalog.subtitle;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/productos`, languages },
    openGraph: {
      title,
      description,
      url: `/${locale}/productos`,
      siteName: messages.common.techAdvisor,
      locale,
      alternateLocale: LOCALES.filter((code) => code !== locale),
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  };
}

/**
 * Localized listing: filters/sort/pagination come from the URL so they
 * survive reloads and shares. Server-fetches the page; the client view only
 * rewrites the URL (fetching happens again on navigation).
 */
export default async function ListingPage({ params, searchParams }: ListingPageProps) {
  const locale = resolveLocale(await params);
  if (locale === null) {
    notFound();
  }
  const query = ((await searchParams) ?? {}) as QueryParams;
  const messages = await getDictionary(locale);
  const catalog = createCatalogApi(createApiClient());

  const rawSort = firstParam(query, 'sort');
  const sort: ProductSort | undefined = (SORTS as readonly string[]).includes(rawSort)
    ? (rawSort as ProductSort)
    : undefined;
  const page = Math.max(1, Number.parseInt(firstParam(query, 'page'), 10) || 1);
  const inStockOnly = firstParam(query, 'inStock') === '1';

  let currency = 'USD';
  try {
    const config = await getPublicConfig(createApiClient());
    currency = resolveCurrency(query, config);
  } catch {
    // Fall through with the base fallback; listing shows its error state below.
  }

  const [productsResult, categoriesResult, brandsResult] = await Promise.allSettled([
    catalog.listProducts({
      page,
      limit: 12,
      sort,
      q: firstParam(query, 'q') || undefined,
      category: firstParam(query, 'category') || undefined,
      brand: firstParam(query, 'brand') || undefined,
      currency,
      locale,
    }),
    catalog.listCategories(locale),
    catalog.listBrands(),
  ]);

  return (
    <Suspense
      fallback={<ListingSkeleton loadingLabel={messages.common.loading} columns="featured" />}
    >
      <ProductListView
        initialData={productsResult.status === 'fulfilled' ? productsResult.value : null}
        loadError={productsResult.status === 'rejected'}
        categories={categoriesResult.status === 'fulfilled' ? categoriesResult.value : []}
        brands={brandsResult.status === 'fulfilled' ? brandsResult.value : []}
        locale={locale}
        currency={currency}
        messages={messages}
        inStockOnly={inStockOnly}
      />
    </Suspense>
  );
}
