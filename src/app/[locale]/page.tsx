import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomeContainer } from '@/features/catalog/containers/home-container';
import { resolveCurrency } from '@/features/catalog/hooks/server-params';
import { getPublicConfig } from '@/lib/api/index';
import { createApiClient } from '@/lib/api/client';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type QueryParams = Record<string, string | string[] | undefined>;

interface HomePageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

function resolveLocale(value: unknown) {
  const locale = (value as { locale?: unknown } | null)?.locale;
  return isLocale(locale) ? locale : null;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = resolveLocale(await params);
  if (locale === null) return {};
  const messages = await getDictionary(locale);
  const languages = Object.fromEntries(LOCALES.map((code) => [code, `/${code}`]));
  return {
    title: messages.common.techAdvisor,
    description: messages.catalog.homeHeroSubtitle,
    alternates: { canonical: `/${locale}`, languages },
  };
}

/** Localized home: hero + featured products + categories. */
export default async function HomePage({ params, searchParams }: HomePageProps) {
  const locale = resolveLocale(await params);
  if (locale === null) {
    notFound();
  }
  const query = ((await searchParams) ?? {}) as QueryParams;
  const messages = await getDictionary(locale);

  let currency = 'USD';
  try {
    const config = await getPublicConfig(createApiClient());
    currency = resolveCurrency(query, config);
  } catch {
    // Container renders its own error state; keep the base fallback here.
  }

  return <HomeContainer locale={locale} currency={currency} messages={messages} />;
}
