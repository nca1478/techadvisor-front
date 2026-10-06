import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { LocaleCurrencyControls } from '@/features/catalog/components/locale-currency-controls';
import { getPublicConfig } from '@/lib/api/index';
import { createApiClient } from '@/lib/api/client';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/** Localized shell: validates the locale, renders nav + selectors + content. */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<unknown>;
}) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);

  let currencies = ['USD'];
  try {
    const config = await getPublicConfig(createApiClient());
    currencies = config.supportedCurrencies;
  } catch {
    // Header still renders with the base fallback; pages show their own error state.
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4 focus:text-foreground"
      >
        {messages.nav.skipToContent}
      </a>
      <header className="border-b border-border bg-background">
        <Container>
          <Stack direction="horizontal" gap="md" align="center" justify="between" className="py-4">
            <Stack direction="horizontal" gap="md" align="center">
              <Text variant="lead" as="span">
                {messages.common.techAdvisor}
              </Text>
              <nav aria-label={messages.common.techAdvisor}>
                <Stack direction="horizontal" gap="md">
                  <Link href={`/${locale}`}>{messages.nav.home}</Link>
                  <Link href={`/${locale}/productos`}>{messages.nav.products}</Link>
                </Stack>
              </nav>
            </Stack>
            <LocaleCurrencyControls
              locale={locale}
              currencies={currencies}
              currencyFallback={currencies[0] ?? 'USD'}
              languageLabel={messages.common.language}
              currencyLabel={messages.common.currency}
            />
          </Stack>
        </Container>
      </header>
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      <footer className="border-t border-border bg-surface">
        <Container>
          <Text variant="caption" tone="muted" as="p" className="py-4">
            {messages.common.techAdvisor}
          </Text>
        </Container>
      </footer>
    </>
  );
}
