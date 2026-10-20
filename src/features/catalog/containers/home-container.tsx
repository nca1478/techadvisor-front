import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { createApiClient } from '@/lib/api/client';
import { createCatalogApi, visibleCategories } from '@/lib/api/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/index';
import { CategoryGrid } from '../components/category-grid';
import { CatalogError } from '../components/catalog-states';
import { HomeAdvisorBand } from '../components/home-editorial';
import { HomeAdvisorHero } from '../components/home-advisor-hero';
import { ProductCardGrid } from '../components/product-card-grid';

export interface HomeContainerProps {
  locale: Locale;
  currency: string;
  messages: Dictionary;
}

/**
 * Home container (Server Component): fetches featured products + categories.
 * Errors render the localized error state instead of throwing.
 */
export async function HomeContainer({ locale, currency, messages }: HomeContainerProps) {
  const catalog = createCatalogApi(createApiClient());

  const [featuredResult, categoriesResult] = await Promise.allSettled([
    // Over-fetch: the backend paginates before stock is known, so asking for
    // exactly 8 and then dropping out-of-stock rows can render 7 (or fewer).
    catalog.listProducts({ limit: 24, sort: 'newest', currency, locale }),
    catalog.listCategories(locale),
  ]);

  if (featuredResult.status === 'rejected' || categoriesResult.status === 'rejected') {
    return (
      <Container>
        <Section>
          <CatalogError title={messages.common.errorTitle} message={messages.catalog.loadError} />
        </Section>
      </Container>
    );
  }

  const products = featuredResult.value.data.filter((product) => product.inStock).slice(0, 8);
  const categories = visibleCategories(categoriesResult.value);
  const listHref = `/${locale}/productos`;
  const advisorHref = `/${locale}/asesor`;
  const coverMessages = {
    badge: messages.catalog.homeCoverBadge,
    title: messages.catalog.homeCoverTitle,
    subtitle: messages.catalog.homeCoverSubtitle,
    cta: messages.catalog.homeCoverCta,
  };
  const advisorBandMessages = {
    badge: messages.catalog.homeAdvisorBadge,
    title: messages.catalog.homeAdvisorTitle,
    question: messages.catalog.homeAdvisorQuestion,
    answerIntro: messages.catalog.homeAdvisorAnswerIntro,
    citationLabel: messages.catalog.homeAdvisorCitationLabel,
    disclaimer: messages.catalog.homeAdvisorDisclaimer,
    cta: messages.catalog.homeAdvisorTrySearch,
  };
  return (
    <>
      <HomeAdvisorHero catalogHref={listHref} messages={coverMessages} />

      <Container>
        <Section spacing="tight">
          <Stack gap="md">
            <Stack direction="horizontal" justify="between" align="end" gap="md">
              <Stack gap="sm">
                <Heading level={2}>{messages.catalog.homeFeaturedTitle}</Heading>
                <Text tone="muted">{messages.catalog.homeFeaturedSubtitle}</Text>
              </Stack>
              <Link href={listHref} className="shrink-0">
                {messages.nav.viewAll}
              </Link>
            </Stack>
            {products.length === 0 ? (
              <Text tone="muted">{messages.catalog.homeEmpty}</Text>
            ) : (
              <ProductCardGrid
                products={products}
                locale={locale}
                currency={currency}
                messages={messages.catalog}
                detailHrefFor={(slug) => `/${locale}/productos/${slug}`}
                columns="featured"
              />
            )}
          </Stack>
        </Section>
      </Container>

      <HomeAdvisorBand locale={locale} advisorHref={advisorHref} messages={advisorBandMessages} />

      {categories.length > 0 && (
        <div className="border-y border-border bg-surface">
          <Container>
            <Section spacing="tight">
              <CategoryGrid
                categories={categories}
                locale={locale}
                title={messages.catalog.homeCategoriesTitle}
                subtitle={messages.catalog.homeCategoriesSubtitle}
                prevLabel={messages.nav.scrollPrev}
                nextLabel={messages.nav.scrollNext}
              />
            </Section>
          </Container>
        </div>
      )}
    </>
  );
}
