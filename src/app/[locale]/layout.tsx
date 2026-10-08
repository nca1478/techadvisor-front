import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { NavSession } from '@/features/auth/components/nav-session';
import { SessionProvider } from '@/features/auth/session-context';
import { CartProvider } from '@/features/cart/cart-context';
import { CartNavLink } from '@/features/cart/components/cart-nav-link';
import { CategoryNav } from '@/features/catalog/components/category-nav';
import { LocaleCurrencyControls } from '@/features/catalog/components/locale-currency-controls';
import { SearchBar } from '@/features/search/components/search-bar';
import { getPublicConfig } from '@/lib/api/index';
import { createCatalogApi, type CatalogCategory } from '@/lib/api/catalog';
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
  let categories: CatalogCategory[] = [];
  try {
    const config = await getPublicConfig(createApiClient());
    currencies = config.supportedCurrencies;
  } catch {
    // Header still renders with the base fallback; pages show their own error state.
  }
  try {
    categories = await createCatalogApi(createApiClient()).listCategories(locale);
  } catch {
    // Header renders without the category row; pages show their own error state.
  }

  return (
    <SessionProvider>
      <CartProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4 focus:text-foreground"
        >
          {messages.nav.skipToContent}
        </a>
        <header className="border-b border-border bg-background">
          <Container>
            <Stack
              direction="horizontal"
              gap="md"
              align="center"
              justify="between"
              wrap
              className="py-4"
            >
              <Stack direction="horizontal" gap="md" align="center" wrap>
                <Text variant="lead" as="span">
                  {messages.common.techAdvisor}
                </Text>
                <nav aria-label={messages.common.techAdvisor}>
                  <Stack direction="horizontal" gap="md" align="center" wrap>
                    <Link href={`/${locale}`}>{messages.nav.home}</Link>
                    <Link href={`/${locale}/productos`}>{messages.nav.products}</Link>
                    <CartNavLink
                      locale={locale}
                      messages={{
                        label: messages.nav.cart,
                        withCount: messages.nav.cartWithCount,
                      }}
                    />
                  </Stack>
                </nav>
              </Stack>
              <Stack direction="horizontal" gap="md" align="center" wrap>
                <NavSession
                  locale={locale}
                  loginLabel={messages.auth.loginLink}
                  registerLabel={messages.auth.registerLink}
                  logoutLabel={messages.auth.logout}
                  accountLabel={messages.auth.account}
                  adminLabel={messages.nav.admin}
                />
                <LocaleCurrencyControls
                  locale={locale}
                  currencies={currencies}
                  currencyFallback={currencies[0] ?? 'USD'}
                  languageLabel={messages.common.language}
                  currencyLabel={messages.common.currency}
                />
              </Stack>
            </Stack>
            <div className="pb-4">
              <SearchBar locale={locale} messages={messages.search} />
            </div>
            {categories.length > 0 ? (
              <div className="border-t border-border py-2">
                <CategoryNav
                  categories={categories}
                  allLabel={messages.nav.allProducts}
                  navLabel={messages.nav.categories}
                  listHref={`/${locale}/productos`}
                  hrefFor={(slug) => `/${locale}/productos?category=${encodeURIComponent(slug)}`}
                />
              </div>
            ) : null}
          </Container>
        </header>
        <main id="main-content" className="flex flex-1 flex-col">
          {children}
        </main>
        <footer className="border-t border-border bg-surface">
          <Container>
            <Grid columns="three" gap="md" className="py-8">
              <Stack gap="sm">
                <Text variant="lead" as="span">
                  {messages.common.techAdvisor}
                </Text>
                <Text variant="small" tone="muted">
                  {messages.footer.note}
                </Text>
              </Stack>
              <Stack gap="sm">
                <Text variant="small" as="p" className="font-medium">
                  {messages.footer.shopTitle}
                </Text>
                <Link href={`/${locale}/productos`} variant="muted">
                  {messages.nav.products}
                </Link>
                <Link href={`/${locale}/buscar`} variant="muted">
                  {messages.search.title}
                </Link>
                <Link href={`/${locale}/carrito`} variant="muted">
                  {messages.nav.cart}
                </Link>
              </Stack>
              <Stack gap="sm">
                <Text variant="small" as="p" className="font-medium">
                  {messages.footer.accountTitle}
                </Text>
                <Link href={`/${locale}/ingresar`} variant="muted">
                  {messages.auth.loginLink}
                </Link>
                <Link href={`/${locale}/registro`} variant="muted">
                  {messages.auth.registerLink}
                </Link>
                <Link href={`/${locale}/cuenta`} variant="muted">
                  {messages.footer.myAccount}
                </Link>
              </Stack>
            </Grid>
          </Container>
        </footer>
      </CartProvider>
    </SessionProvider>
  );
}
