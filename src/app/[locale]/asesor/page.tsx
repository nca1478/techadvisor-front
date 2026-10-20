import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { AdvisorChat } from '@/features/advisor';
import { getPublicConfig } from '@/lib/api/index';
import { createApiClient } from '@/lib/api/client';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface AdvisorPageProps {
  params: Promise<unknown>;
}

function resolveLocale(value: unknown) {
  const locale = (value as { locale?: unknown } | null)?.locale;
  return isLocale(locale) ? locale : null;
}

export async function generateMetadata({ params }: AdvisorPageProps): Promise<Metadata> {
  const locale = resolveLocale(await params);
  if (locale === null) return {};
  const messages = await getDictionary(locale);
  const languages = Object.fromEntries(LOCALES.map((code) => [code, `/${code}/asesor`]));
  return {
    title: `${messages.chat.title} — ${messages.common.techAdvisor}`,
    description: messages.chat.subtitle,
    alternates: { canonical: `/${locale}/asesor`, languages },
    // Personal conversation: never indexed.
    robots: { index: false, follow: false },
  };
}

// Always rendered on demand (`force-dynamic`): the AI kill-switch
// (`aiEnabled` from `GET /config/public`) must be read per request, otherwise
// a static prerender would bake in the build-time value and toggling
// AI_ENABLED would have no effect until the next build.
export const dynamic = 'force-dynamic';

/**
 * Conversational buying advisor. The `AdvisorChat` container owns the chat
 * session (guest or authenticated via the BFF cookies), restores history
 * after reloads and streams recommendations with hydrated product cards.
 */
export default async function AdvisorPage({ params }: AdvisorPageProps) {
  const locale = resolveLocale(await params);
  if (locale === null) {
    notFound();
  }
  const messages = await getDictionary(locale);

  let aiEnabled = true;
  try {
    aiEnabled = (await getPublicConfig(createApiClient())).aiEnabled;
  } catch {
    // The chat container renders its own error state; keep the default.
  }

  if (!aiEnabled) {
    return (
      <Container className="flex flex-1 flex-col py-6">
        <Heading level={1}>{messages.chat.title}</Heading>
        <div className="mt-4 flex flex-1 flex-col">
          <Card>
            <Stack gap="sm" className="px-6 py-12 text-center" align="center">
              <Text tone="muted">{messages.chat.disabled}</Text>
            </Stack>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-1 flex-col py-6">
      <Heading level={1}>{messages.chat.title}</Heading>
      <div className="mt-4 flex flex-1 flex-col">
        <AdvisorChat locale={locale} messages={messages} />
      </div>
    </Container>
  );
}
