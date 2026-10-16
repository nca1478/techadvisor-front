import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { ImagesEditorContainer } from '@/features/admin/containers/images-editor-container';
import { InventoryPanelContainer } from '@/features/admin/containers/inventory-panel-container';
import { ProductEditContainer } from '@/features/admin/containers/product-edit-container';
import { ProductStatusContainer } from '@/features/admin/containers/product-status-container';
import { backendFetch } from '@/lib/api/backend';
import type { AdminInventory, AdminInventoryMovement, AdminProduct } from '@/lib/api/admin';
import { createApiClient } from '@/lib/api/client';
import { createCatalogApi } from '@/lib/api/catalog';
import { getPublicConfig } from '@/lib/api/index';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.productForm.editTitle} — ${messages.common.techAdvisor}` };
}

function isProduct(value: unknown): value is AdminProduct {
  return value !== null && typeof value === 'object' && 'id' in value && 'sku' in value;
}

function isInventory(value: unknown): value is AdminInventory {
  return value !== null && typeof value === 'object' && 'stock' in value && 'available' in value;
}

function isMovementList(value: unknown): value is AdminInventoryMovement[] {
  return Array.isArray(value);
}

/** Edit product: base fields + status + images + inventory in one screen. */
export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const resolved = (await params) as { locale?: unknown; id?: unknown };
  if (!isLocale(resolved.locale) || typeof resolved.id !== 'string') {
    notFound();
  }
  const locale = resolved.locale;
  const id = resolved.id;
  const messages = await getDictionary(locale);

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const catalog = createCatalogApi(createApiClient());
  const [
    productResult,
    inventoryResult,
    movementsResult,
    categoriesResult,
    brandsResult,
    configResult,
  ] = await Promise.all([
    backendFetch(`/admin/products/${encodeURIComponent(id)}`, { method: 'GET', cookieHeader }),
    backendFetch(`/admin/inventory/${encodeURIComponent(id)}`, { method: 'GET', cookieHeader }),
    backendFetch(`/admin/inventory/${encodeURIComponent(id)}/movements`, {
      method: 'GET',
      cookieHeader,
    }),
    catalog.listCategories(locale).then(
      (value) => ({ ok: true as const, value }),
      () => ({ ok: false as const }),
    ),
    catalog.listBrands().then(
      (value) => ({ ok: true as const, value }),
      () => ({ ok: false as const }),
    ),
    getPublicConfig(createApiClient()).then(
      (value) => ({ ok: true as const, value }),
      () => ({ ok: false as const }),
    ),
  ]);

  if (productResult.status === 404) {
    notFound();
  }
  const product =
    productResult.status === 200 && isProduct(productResult.body) ? productResult.body : null;
  if (product === null) {
    return (
      <Text role="alert" className="text-destructive">
        {messages.admin.loadError}
      </Text>
    );
  }

  const inventory =
    inventoryResult.status === 200 && isInventory(inventoryResult.body)
      ? inventoryResult.body
      : null;
  const movements =
    movementsResult.status === 200 && isMovementList(movementsResult.body)
      ? movementsResult.body
      : [];
  const categories = categoriesResult.ok ? categoriesResult.value : [];
  const brands = brandsResult.ok ? brandsResult.value : [];
  const config = configResult.ok
    ? configResult.value
    : {
        baseCurrency: 'USD',
        supportedCurrencies: ['USD'],
        defaultLocale: 'en',
        supportedLocales: ['en', 'es'],
      };

  return (
    <Stack gap="md">
      <Link href={`/${locale}/admin/productos`}>{messages.admin.productForm.backToProducts}</Link>
      <Stack direction="horizontal" gap="md" align="center" wrap>
        <Heading level={2}>{messages.admin.productForm.editTitle}</Heading>
      </Stack>
      <Card>
        <ProductStatusContainer
          productId={product.id}
          initialStatus={product.status}
          messages={messages}
        />
      </Card>
      <Card>
        <ProductEditContainer
          product={product}
          brands={brands}
          categories={categories}
          currencies={config.supportedCurrencies}
          locales={config.supportedLocales}
          defaultLocale={config.defaultLocale}
          messages={messages}
          extraSteps={[
            {
              title: messages.admin.images.title,
              content: (
                <ImagesEditorContainer
                  key="images"
                  productId={product.id}
                  initialImages={product.images}
                  messages={messages}
                />
              ),
            },
            {
              title: messages.admin.inventory.title,
              content: (
                <InventoryPanelContainer
                  key="inventory"
                  productId={product.id}
                  productName={product.name}
                  initialInventory={inventory}
                  initialMovements={movements}
                  locale={locale}
                  messages={messages}
                />
              ),
            },
          ]}
        />
      </Card>
    </Stack>
  );
}
