import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { createApiClient } from '@/lib/api/client';
import { createCatalogApi } from '@/lib/api/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/index';
import { CategoryGrid } from '../components/category-grid';
import { CatalogError } from '../components/catalog-states';
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
    catalog.listProducts({ limit: 8, sort: 'newest', currency, locale }),
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
  const categories = categoriesResult.value;
  const listHref = `/${locale}/productos`;
  const advisorPicks = products.slice(0, 3).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
  }));
  const advisorSearchHref = `/${locale}/buscar?q=${encodeURIComponent(messages.catalog.homeAdvisorQuestion)}`;
  const advisorMessages = {
    badge: messages.catalog.homeAdvisorBadge,
    title: messages.catalog.homeAdvisorTitle,
    question: messages.catalog.homeAdvisorQuestion,
    answerIntro: messages.catalog.homeAdvisorAnswerIntro,
    citationLabel: messages.catalog.homeAdvisorCitationLabel,
    disclaimer: messages.catalog.homeAdvisorDisclaimer,
    trySearch: messages.catalog.homeAdvisorTrySearch,
    picksLabel: messages.catalog.homeAdvisorPicksLabel,
    emptyPicks: messages.catalog.homeAdvisorEmptyPicks,
  };

  return (
    <Container>
      <Section spacing="tight">
        <Stack gap="sm">
          <Heading level={1}>{messages.common.techAdvisor}</Heading>
          <Text variant="lead" tone="muted">
            {messages.catalog.homeHeroSubtitle}
          </Text>
        </Stack>
      </Section>

      <Section spacing="tight">
        <HomeAdvisorHero
          locale={locale}
          searchHref={advisorSearchHref}
          picks={advisorPicks}
          detailHrefFor={(slug) => `/${locale}/productos/${slug}`}
          messages={advisorMessages}
        />
      </Section>

      <Section spacing="tight">
        <Stack gap="md">
          <Stack gap="sm">
            <Heading level={2}>{messages.catalog.homeFeaturedTitle}</Heading>
            <Text tone="muted">{messages.catalog.homeFeaturedSubtitle}</Text>
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
            />
          )}
          <Link href={listHref}>{messages.nav.viewAll}</Link>
        </Stack>
      </Section>

      <Section spacing="tight">
        <CategoryGrid
          categories={categories}
          title={messages.catalog.homeCategoriesTitle}
          subtitle={messages.catalog.homeCategoriesSubtitle}
          hrefFor={(slug) => `/${locale}/productos?category=${encodeURIComponent(slug)}`}
        />
      </Section>
    </Container>
  );
}
