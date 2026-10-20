import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { CompareView } from '@/features/compare/containers/compare-view';
import { getPublicConfig } from '@/lib/api/index';
import { createApiClient } from '@/lib/api/client';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Always rendered on demand (`force-dynamic`): the AI kill-switch
// (`aiEnabled` from `GET /config/public`) must be read per request, otherwise
// a static prerender would bake in the build-time value and toggling
// AI_ENABLED would have no effect until the next build.
export const dynamic = 'force-dynamic';

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

  let aiEnabled = true;
  try {
    aiEnabled = (await getPublicConfig(createApiClient())).aiEnabled;
  } catch {
    // CompareView renders its own error state; keep the default.
  }

  // Decisión de producto: con la IA apagada no se muestra nada del
  // comparador (ni tabla ni resumen), solo el aviso.
  if (!aiEnabled) {
    return (
      <Container>
        <Section>
          <Stack gap="md">
            <Stack gap="sm">
              <Heading level={1}>{messages.compare.page.title}</Heading>
              <Text tone="muted">{messages.compare.page.subtitle}</Text>
            </Stack>
            <Card>
              <Stack gap="md" align="center" className="px-6 py-12 text-center">
                <Text tone="muted">{messages.compare.page.disabled}</Text>
              </Stack>
            </Card>
          </Stack>
        </Section>
      </Container>
    );
  }

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
