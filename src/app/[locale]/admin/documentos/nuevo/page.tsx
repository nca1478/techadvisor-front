import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { AssociationOption } from '@/features/admin/components/association-select';
import { DocumentUploadContainer } from '@/features/admin/containers/document-upload-container';
import { backendFetch } from '@/lib/api/backend';
import type { AdminCategory, AdminProductList } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface NewDocumentPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: NewDocumentPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.documents.newTitle} — ${messages.common.techAdvisor}` };
}

function firstParam(query: Record<string, unknown>, key: string): string {
  const value = query[key];
  return typeof value === 'string' ? value : '';
}

function isProductList(value: unknown): value is AdminProductList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

function isCategoryList(value: unknown): value is AdminCategory[] {
  return Array.isArray(value);
}

/**
 * New document: two-step wizard (upload file, then optionally register URL).
 * Step 1 association selects are fed server-side (friendly names, ids stored):
 * up to 100 products for the dropdown plus the full category list.
 */
export default async function AdminNewDocumentPage({ params, searchParams }: NewDocumentPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const docs = messages.admin.documents;
  const queryParams = ((await searchParams) ?? {}) as Record<string, unknown>;

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const [productsResult, categoriesResult] = await Promise.all([
    backendFetch('/admin/products?page=1&limit=100', { method: 'GET', cookieHeader }),
    backendFetch('/admin/categories', { method: 'GET', cookieHeader }),
  ]);
  const products =
    productsResult.status === 200 && isProductList(productsResult.body)
      ? productsResult.body.data
      : [];
  const categories =
    categoriesResult.status === 200 && isCategoryList(categoriesResult.body)
      ? categoriesResult.body
      : [];

  const productOptions: AssociationOption[] = products.map((product) => ({
    id: product.id,
    label: product.name,
    hint: product.sku,
  }));
  const categoryOptions: AssociationOption[] = categories.map((category) => ({
    id: category.id,
    label: category.name,
    hint: category.slug,
  }));

  return (
    <Stack gap="md">
      <Link href={`/${locale}/admin/documentos`}>{docs.backToDocuments}</Link>
      <Stack gap="sm">
        <Heading level={2}>{docs.newTitle}</Heading>
        <Text tone="muted">{docs.newSubtitle}</Text>
      </Stack>
      <Card>
        <DocumentUploadContainer
          locale={locale}
          messages={messages}
          initialTitle={firstParam(queryParams, 'title').slice(0, 200)}
          productOptions={productOptions}
          categoryOptions={categoryOptions}
        />
      </Card>
    </Stack>
  );
}
