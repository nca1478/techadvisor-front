import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Tabs } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { SupportAssistant } from '@/features/support';
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

interface SupportPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: SupportPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  const languages = Object.fromEntries(LOCALES.map((code) => [code, `/${code}/soporte`]));
  return {
    title: `${messages.support.title} — ${messages.common.techAdvisor}`,
    description: messages.support.subtitle,
    alternates: { canonical: `/${resolved.locale}/soporte`, languages },
  };
}

/**
 * Post-sale support page. The `SupportAssistant` container answers warranty,
 * shipping, returns and payment questions with cited policy evidence (or an
 * owned order's SQL facts); below it, the full policy texts the assistant
 * uses as its source, one per tab.
 */
export default async function SupportPage({ params }: SupportPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);

  let aiEnabled = true;
  try {
    aiEnabled = (await getPublicConfig(createApiClient())).aiEnabled;
  } catch {
    // The assistant renders its own error state; keep the default.
  }

  return (
    <Container className="flex flex-1 flex-col gap-8 py-6">
      <Stack gap="sm">
        <Heading level={1} visual={2}>
          {messages.support.assistantTitle}
        </Heading>
        <Text variant="small" tone="muted">
          {messages.support.assistantSubtitle}
        </Text>
      </Stack>

      {aiEnabled ? (
        <SupportAssistant locale={locale} messages={messages.support} showHeader={false} />
      ) : (
        <Card>
          <Stack gap="sm" className="px-6 py-12 text-center" align="center">
            <Text tone="muted">{messages.support.disabled}</Text>
          </Stack>
        </Card>
      )}

      <section aria-labelledby="policies-heading">
        <Stack gap="md">
          <Stack gap="sm">
            <span id="policies-heading" className="sr-only">
              {messages.support.policiesTitle}
            </span>
            <Heading level={2}>{messages.support.policiesTitle}</Heading>
            <Text variant="small" tone="muted">
              {messages.support.subtitle}
            </Text>
          </Stack>

          <Tabs
            label={messages.support.policiesTitle}
            items={messages.support.policies.map((policy) => ({
              id: policy.id,
              label: policy.title,
              content: (
                <Card>
                  <Stack gap="sm">
                    <Heading level={3}>{policy.title}</Heading>
                    <Badge tone="neutral">{messages.support.templateNotice}</Badge>
                    {policy.body.split('\n\n').map((paragraph, index) => (
                      <Text key={`${policy.id}-${String(index)}`} variant="small">
                        {paragraph}
                      </Text>
                    ))}
                  </Stack>
                </Card>
              ),
            }))}
          />
        </Stack>
      </section>
    </Container>
  );
}
