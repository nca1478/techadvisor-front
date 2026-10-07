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

// ISR for product pages (see docs/decisions/0009-seo-isr.md): rendered on
// demand and revalidated every 5 minutes. Price/stock staleness is bounded
// and harmless here — the cart and checkout always read live data.
export const revalidate = 300;
export const dynamicParams = true;

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
  const url = `/${locale}/productos/${slug}`;
  try {
    const product = await createCatalogApi(createApiClient()).productDetail(slug, locale);
    const title = `${product.name} — ${messages.common.techAdvisor}`;
    const description = product.description.slice(0, 160);
    const firstImage = product.images.at(0)?.url ?? null;
    const images =
      typeof firstImage === 'string' && firstImage.length > 0 ? [{ url: firstImage }] : undefined;
    return {
      title,
      description,
      alternates: { canonical: url, languages },
      openGraph: {
        title,
        description,
        url,
        siteName: messages.common.techAdvisor,
        locale,
        alternateLocale: LOCALES.filter((code) => code !== locale),
        type: 'website',
        ...(images ? { images } : {}),
      },
      twitter: {
        card: images ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(images ? { images: images.map((image) => image.url) } : {}),
      },
    };
  } catch {
    return {
      title: messages.catalog.title,
      alternates: { canonical: url, languages },
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
