import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { NavSession } from '@/features/auth/components/nav-session';
import { SessionProvider } from '@/features/auth/session-context';
import { AdvisorFab } from '@/features/advisor';
import { CartProvider } from '@/features/cart/cart-context';
import { CompareSelectionProvider } from '@/features/compare/compare-selection-context';
import { ResetCompareOnNavigation } from '@/features/compare/reset-on-navigation';
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
        <CompareSelectionProvider>
          {/* useSearchParams exige Suspense en prerender; este subárbol no pinta nada. */}
          <Suspense fallback={null}>
            <ResetCompareOnNavigation />
          </Suspense>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4 focus:text-foreground"
          >
            {messages.nav.skipToContent}
          </a>
          <header className="bg-header text-header-foreground">
            <Container>
              {/* Primera línea (referencia): marca, buscador, iconos. */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 py-3">
                <Link
                  href={`/${locale}`}
                  variant="brand"
                  className="shrink-0 text-xl font-semibold leading-relaxed"
                  ariaLabel={messages.nav.home}
                >
                  {messages.common.techAdvisor}
                </Link>
                <div className="order-last ml-auto min-w-0 w-full flex-1 basis-full sm:order-none sm:w-64 sm:flex-none lg:w-80">
                  <SearchBar locale={locale} messages={messages.search} />
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <CartNavLink
                    locale={locale}
                    messages={{
                      label: messages.nav.cart,
                      withCount: messages.nav.cartWithCount,
                    }}
                  />
                  <NavSession
                    locale={locale}
                    loginLabel={messages.auth.loginLink}
                    registerLabel={messages.auth.registerLink}
                    logoutLabel={messages.auth.logout}
                    accountShortLabel={messages.auth.accountShort}
                    adminLabel={messages.nav.admin}
                  />
                  <LocaleCurrencyControls
                    locale={locale}
                    currencies={currencies}
                    currencyFallback={currencies[0] ?? 'USD'}
                    languageLabel={messages.common.language}
                    currencyLabel={messages.common.currency}
                  />
                </div>
              </div>
            </Container>
            {/* Segunda línea: categorías, con divisora a todo el ancho. */}
            {categories.length > 0 ? (
              <div className="border-t border-header-sub">
                <Container>
                  <div className="py-2">
                    <CategoryNav
                      categories={categories}
                      allLabel={messages.nav.allProducts}
                      navLabel={messages.nav.categories}
                      listHref={`/${locale}/productos`}
                      hrefFor={(slug) =>
                        `/${locale}/productos?category=${encodeURIComponent(slug)}`
                      }
                    />
                  </div>
                </Container>
              </div>
            ) : null}
          </header>
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
          <AdvisorFab locale={locale} label={messages.nav.asesor} />
          <footer className="bg-header-sub">
            <Container>
              <Grid columns="three" gap="md" className="py-8">
                <Stack gap="sm">
                  <Text variant="lead" as="span" tone="header">
                    {messages.common.techAdvisor}
                  </Text>
                  <Text variant="small" tone="headerMuted">
                    {messages.footer.note}
                  </Text>
                </Stack>
                <Stack gap="sm">
                  <Text variant="small" as="p" tone="header" className="font-medium">
                    {messages.footer.shopTitle}
                  </Text>
                  <Link href={`/${locale}/productos`} variant="header">
                    {messages.nav.products}
                  </Link>
                  <Link href={`/${locale}/buscar`} variant="header">
                    {messages.search.title}
                  </Link>
                  <Link href={`/${locale}/asesor`} variant="header">
                    {messages.nav.asesor}
                  </Link>
                  <Link href={`/${locale}/carrito`} variant="header">
                    {messages.nav.cart}
                  </Link>
                </Stack>
                <Stack gap="sm">
                  <Text variant="small" as="p" tone="header" className="font-medium">
                    {messages.footer.accountTitle}
                  </Text>
                  <Link href={`/${locale}/ingresar`} variant="header">
                    {messages.auth.loginLink}
                  </Link>
                  <Link href={`/${locale}/registro`} variant="header">
                    {messages.auth.registerLink}
                  </Link>
                  <Link href={`/${locale}/cuenta`} variant="header">
                    {messages.footer.myAccount}
                  </Link>
                </Stack>
              </Grid>
            </Container>
          </footer>
        </CompareSelectionProvider>
      </CartProvider>
    </SessionProvider>
  );
}
