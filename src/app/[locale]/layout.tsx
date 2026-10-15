import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import {
  DiscordIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  VoltBoltIcon,
  YouTubeIcon,
} from '@/components/ui/social-icons';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { NavSession } from '@/features/auth/components/nav-session';
import { SessionProvider } from '@/features/auth/session-context';
import { AdvisorFab } from '@/features/advisor';
import { CartProvider } from '@/features/cart/cart-context';
import { CompareSelectionProvider } from '@/features/compare/compare-selection-context';
import { ResetCompareOnNavigation } from '@/features/compare/reset-on-navigation';
import { ThemeProvider, ThemeToggle } from '@/features/theme';
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
    const allCategories = await createCatalogApi(createApiClient()).listCategories(locale);
    // The admin `showInHome` flag controls the header menu too, same as the
    // home "Shop by category" section; rows created before the contract
    // carry no flag and default to visible (same as the DB).
    categories = allCategories.filter(
      (category) => (category as unknown as Record<string, unknown>)['showInHome'] !== false,
    );
  } catch {
    // Header renders without the category row; pages show their own error state.
  }

  return (
    <SessionProvider>
      <CartProvider>
        <CompareSelectionProvider>
          <ThemeProvider>
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
                    <ThemeToggle
                      messages={{
                        switchToLight: messages.common.themeSwitchToLight,
                        switchToDark: messages.common.themeSwitchToDark,
                      }}
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
            <footer className="border-t border-border bg-header text-header-foreground">
              <Container>
                <div className="grid grid-cols-1 gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-12">
                  <Stack gap="sm" align="start">
                    <Link
                      href={`/${locale}`}
                      variant="brand"
                      className="display inline-flex items-center gap-2 text-xl font-semibold uppercase leading-relaxed tracking-tight"
                      ariaLabel={messages.nav.home}
                    >
                      <VoltBoltIcon className="size-6 text-primary" />
                      {messages.common.techAdvisor}
                    </Link>
                    <Text variant="small" tone="headerMuted">
                      {messages.footer.note}
                    </Text>
                    <Button href={`/${locale}/registro`} size="md" className="mt-2 rounded-full">
                      {messages.footer.newsletter}
                    </Button>
                    <nav aria-label={messages.footer.socialLabel}>
                      <ul className="mt-2 flex flex-wrap items-center gap-1">
                        <li>
                          <Link
                            href="https://youtube.com"
                            variant="header"
                            ariaLabel="YouTube"
                            className="inline-flex p-2 text-header-muted transition-colors duration-150 hover:text-header-foreground"
                          >
                            <YouTubeIcon />
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="https://facebook.com"
                            variant="header"
                            ariaLabel="Facebook"
                            className="inline-flex p-2 text-header-muted transition-colors duration-150 hover:text-header-foreground"
                          >
                            <FacebookIcon />
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="https://linkedin.com"
                            variant="header"
                            ariaLabel="LinkedIn"
                            className="inline-flex p-2 text-header-muted transition-colors duration-150 hover:text-header-foreground"
                          >
                            <LinkedInIcon />
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="https://instagram.com"
                            variant="header"
                            ariaLabel="Instagram"
                            className="inline-flex p-2 text-header-muted transition-colors duration-150 hover:text-header-foreground"
                          >
                            <InstagramIcon />
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="https://tiktok.com"
                            variant="header"
                            ariaLabel="TikTok"
                            className="inline-flex p-2 text-header-muted transition-colors duration-150 hover:text-header-foreground"
                          >
                            <TikTokIcon />
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="https://discord.com"
                            variant="header"
                            ariaLabel="Discord"
                            className="inline-flex p-2 text-header-muted transition-colors duration-150 hover:text-header-foreground"
                          >
                            <DiscordIcon />
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  </Stack>
                  <nav aria-label={messages.footer.productsTitle}>
                    <Stack gap="sm">
                      <Text
                        variant="small"
                        as="p"
                        tone="headerMuted"
                        className="font-mono text-xs font-medium uppercase tracking-widest"
                      >
                        {messages.footer.productsTitle}
                      </Text>
                      <Link href={`/${locale}/productos`} variant="header" className="text-sm">
                        {messages.nav.products}
                      </Link>
                      <Link href={`/${locale}/buscar`} variant="header" className="text-sm">
                        {messages.search.title}
                      </Link>
                      <Link href={`/${locale}/comparar`} variant="header" className="text-sm">
                        {messages.compare.title}
                      </Link>
                      <Link href={`/${locale}/asesor`} variant="header" className="text-sm">
                        {messages.nav.asesor}
                      </Link>
                    </Stack>
                  </nav>
                  <nav aria-label={messages.footer.helpTitle}>
                    <Stack gap="sm">
                      <Text
                        variant="small"
                        as="p"
                        tone="headerMuted"
                        className="font-mono text-xs font-medium uppercase tracking-widest"
                      >
                        {messages.footer.helpTitle}
                      </Text>
                      <Link href={`/${locale}/soporte`} variant="header" className="text-sm">
                        {messages.support.navLabel}
                      </Link>
                      <Link href={`/${locale}/carrito`} variant="header" className="text-sm">
                        {messages.nav.cart}
                      </Link>
                      <Link href={`/${locale}/cuenta/ordenes`} variant="header" className="text-sm">
                        {messages.account.ordersTitle}
                      </Link>
                    </Stack>
                  </nav>
                  <nav aria-label={messages.footer.companyTitle}>
                    <Stack gap="sm">
                      <Text
                        variant="small"
                        as="p"
                        tone="headerMuted"
                        className="font-mono text-xs font-medium uppercase tracking-widest"
                      >
                        {messages.footer.companyTitle}
                      </Text>
                      <Link href={`/${locale}/ingresar`} variant="header" className="text-sm">
                        {messages.auth.loginLink}
                      </Link>
                      <Link href={`/${locale}/registro`} variant="header" className="text-sm">
                        {messages.auth.registerLink}
                      </Link>
                      <Link href={`/${locale}/cuenta`} variant="header" className="text-sm">
                        {messages.footer.myAccount}
                      </Link>
                    </Stack>
                  </nav>
                </div>
                <div className="border-t border-border py-5">
                  <Text variant="small" tone="headerMuted">
                    © {new Date().getFullYear()} {messages.common.techAdvisor}.{' '}
                    {messages.footer.rights}
                  </Text>
                </div>
              </Container>
            </footer>
          </ThemeProvider>
        </CompareSelectionProvider>
      </CartProvider>
    </SessionProvider>
  );
}
