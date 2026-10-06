import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailContainer } from '@/features/catalog/containers/product-detail-container';
import { resolveCurrency } from '@/features/catalog/hooks/server-params';
import { getPublicConfig } from '@/lib/api/index';
import { createApiClient } from '@/lib/api/client';
import { createCatalogApi } from '@/lib/api/catalog';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type QueryParams = Record<string, string | string[] | undefined>;

interface DetailPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

function resolveRoute(value: unknown) {
  const route = (value as { locale?: unknown; slug?: unknown } | null) ?? {};
  if (!isLocale(route.locale) || typeof route.slug !== 'string') return null;
  return { locale: route.locale, slug: route.slug };
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const route = resolveRoute(await params);
  if (route === null) return {};
  const { locale, slug } = route;
  const messages = await getDictionary(locale);
  const languages = Object.fromEntries(LOCALES.map((code) => [code, `/${code}/productos/${slug}`]));
  try {
    const product = await createCatalogApi(createApiClient()).productDetail(slug, locale);
    return {
      title: `${product.name} — ${messages.common.techAdvisor}`,
      description: product.description.slice(0, 160),
      alternates: { canonical: `/${locale}/productos/${slug}`, languages },
    };
  } catch {
    return {
      title: messages.catalog.title,
      alternates: { canonical: `/${locale}/productos/${slug}`, languages },
    };
  }
}

/** Localized detail: data from SQL-backed API, specs table, stock badge. */
export default async function DetailPage({ params, searchParams }: DetailPageProps) {
  const route = resolveRoute(await params);
  if (route === null) {
    notFound();
  }
  const { locale, slug } = route;
  const query = ((await searchParams) ?? {}) as QueryParams;
  const messages = await getDictionary(locale);

  let currency = 'USD';
  try {
    const config = await getPublicConfig(createApiClient());
    currency = resolveCurrency(query, config);
  } catch {
    // Detail container renders its own error state; keep the fallback.
  }

  // Unknown slugs surface as the locale not-found page in the container.
  return (
    <ProductDetailContainer slug={slug} locale={locale} currency={currency} messages={messages} />
  );
}
