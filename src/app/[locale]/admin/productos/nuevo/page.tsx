import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { ProductCreateContainer } from '@/features/admin/containers/product-create-container';
import { createApiClient } from '@/lib/api/client';
import { createCatalogApi } from '@/lib/api/catalog';
import { getPublicConfig } from '@/lib/api/index';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface NewProductPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: NewProductPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.productForm.newTitle} — ${messages.common.techAdvisor}` };
}

/** New product: reference data (categories with specs schemas, brands, currencies) is server-fetched. */
export default async function AdminNewProductPage({ params }: NewProductPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const catalog = createCatalogApi(createApiClient());

  const [categoriesResult, brandsResult, configResult] = await Promise.allSettled([
    catalog.listCategories(locale),
    catalog.listBrands(),
    getPublicConfig(createApiClient()),
  ]);
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const brands = brandsResult.status === 'fulfilled' ? brandsResult.value : [];
  const config =
    configResult.status === 'fulfilled'
      ? configResult.value
      : {
          baseCurrency: 'USD',
          supportedCurrencies: ['USD'],
          defaultLocale: 'en',
          supportedLocales: ['en', 'es'],
        };
  const failed = categoriesResult.status === 'rejected' || brandsResult.status === 'rejected';

  return (
    <Stack gap="md">
      <Link href={`/${locale}/admin/productos`}>{messages.admin.productForm.backToProducts}</Link>
      <Stack gap="sm">
        <Heading level={2}>{messages.admin.productForm.newTitle}</Heading>
        <Text tone="muted">{messages.admin.productForm.newSubtitle}</Text>
      </Stack>
      {failed ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : (
        <Card>
          <ProductCreateContainer
            locale={locale}
            brands={brands}
            categories={categories}
            currencies={config.supportedCurrencies}
            baseCurrency={config.baseCurrency}
            locales={config.supportedLocales}
            defaultLocale={config.defaultLocale}
            messages={messages}
          />
        </Card>
      )}
    </Stack>
  );
}
