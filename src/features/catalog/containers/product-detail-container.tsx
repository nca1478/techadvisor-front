import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Grid } from '@/components/ui/grid';
import { Link } from '@/components/ui/link';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { ProductAdvisor } from '@/features/advisor';
import { ApiError } from '@/lib/api/errors';
import { createApiClient } from '@/lib/api/client';
import { createCatalogApi } from '@/lib/api/catalog';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/index';
import { productJsonLd } from '@/lib/seo/site';
import { CatalogError } from '../components/catalog-states';
import { ProductGallery } from '../components/product-gallery';
import { ProductInfo } from '../components/product-info';

export interface ProductDetailContainerProps {
  slug: string;
  locale: Locale;
  currency: string;
  messages: Dictionary;
}

/**
 * Detail container (Server Component): fetches one product by slug.
 * Unknown slugs render `notFound()`; other failures render the error state.
 */
export async function ProductDetailContainer({
  slug,
  locale,
  currency,
  messages,
}: ProductDetailContainerProps) {
  const catalog = createCatalogApi(createApiClient());

  let product = null;
  try {
    product = await catalog.productDetail(slug, locale);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }
  }

  if (product === null) {
    return (
      <Container>
        <Section>
          <CatalogError title={messages.common.errorTitle} message={messages.catalog.detailError} />
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section spacing="tight">
        <Stack gap="md">
          <Link href={`/${locale}/productos`} variant="muted">
            {messages.catalog.backToList}
          </Link>
          <Grid columns="two" gap="lg">
            <ProductGallery images={product.images} productName={product.name} />
            <ProductInfo
              product={product}
              locale={locale}
              currency={currency}
              messages={messages.catalog}
            />
          </Grid>
          <ProductAdvisor
            key={product.id}
            productId={product.id}
            categorySlug={product.category.slug}
            locale={locale}
            supportHref={`/${locale}/soporte`}
            messages={messages.advisor}
          />
        </Stack>
      </Section>
      {/* schema.org Product: name/image/price+currency/availability from the API. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd({
              product,
              locale,
              path: `/${locale}/productos/${slug}`,
            }),
          ),
        }}
      />
    </Container>
  );
}
