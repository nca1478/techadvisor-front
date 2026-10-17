import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CompareView } from '@/features/compare/containers/compare-view';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface ComparePageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.compare.title} — ${messages.common.techAdvisor}` };
}

/**
 * Localized compare page. Product ids travel in `?ids=a,b,c` (2..3) so the
 * comparison survives reloads and shares; the client view fetches
 * `POST /api/advisor/compare` (tabla SQL + veredicto determinista).
 * El resumen del asesor queda oculto por ahora (`showAdvisorSummary` en
 * `false` por defecto): el componente `CompareSummary` no se elimina para
 * reutilizarlo más adelante.
 */
export default async function ComparePage({ params, searchParams }: ComparePageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const query = ((await searchParams) ?? {}) as Record<string, string | string[] | undefined>;
  const rawIds = query['ids'];
  const idsParam = Array.isArray(rawIds) ? rawIds.join(',') : (rawIds ?? '');
  const messages = await getDictionary(locale);
  return (
    <CompareView
      idsParam={idsParam}
      locale={locale}
      productsHref={`/${locale}/productos`}
      messages={messages.compare.page}
      specLabels={messages.catalog.specLabels}
    />
  );
}
