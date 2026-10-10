import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { AdvisorChat } from '@/features/advisor';
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

  return (
    <Container className="flex flex-1 flex-col py-6">
      <Heading level={1}>{messages.chat.title}</Heading>
      <div className="mt-4 flex flex-1 flex-col">
        <AdvisorChat locale={locale} messages={messages} />
      </div>
    </Container>
  );
}
