import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { SupportAssistant } from '@/features/support';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

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
 * uses as its source, each reachable through its anchor link.
 */
export default async function SupportPage({ params }: SupportPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);

  return (
    <Container className="flex flex-1 flex-col gap-8 py-6">
      <Stack gap="sm">
        <Heading level={1}>{messages.support.title}</Heading>
        <Text tone="muted">{messages.support.subtitle}</Text>
      </Stack>

      <SupportAssistant locale={locale} messages={messages.support} />

      <section aria-labelledby="policies-heading">
        <Stack gap="md">
          <Stack gap="sm">
            <span id="policies-heading" className="sr-only">
              {messages.support.policiesTitle}
            </span>
            <Heading level={2}>{messages.support.policiesTitle}</Heading>
            <Text variant="small" tone="muted">
              {messages.support.policiesSubtitle}
            </Text>
          </Stack>

          <nav aria-label={messages.support.policiesTitle}>
            <ul className="flex flex-wrap gap-2">
              {messages.support.policies.map((policy) => (
                <li key={policy.id}>
                  <a
                    href={`#politica-${policy.id}`}
                    className="text-link underline-offset-4 hover:underline"
                  >
                    {policy.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-4">
            {messages.support.policies.map((policy) => (
              <div key={policy.id} id={`politica-${policy.id}`} className="scroll-mt-24">
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
              </div>
            ))}
          </div>
        </Stack>
      </section>
    </Container>
  );
}
