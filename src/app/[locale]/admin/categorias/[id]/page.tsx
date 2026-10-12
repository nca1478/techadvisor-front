import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { CategoryEditContainer } from '@/features/admin/containers/category-edit-container';
import { backendFetch } from '@/lib/api/backend';
import type { AdminCategory } from '@/lib/api/admin';
import { createApiClient } from '@/lib/api/client';
import { getPublicConfig } from '@/lib/api/index';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface EditCategoryPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: EditCategoryPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.categoryForm.editTitle} — ${messages.common.techAdvisor}` };
}

function isCategory(value: unknown): value is AdminCategory {
  return value !== null && typeof value === 'object' && 'id' in value && 'slug' in value;
}

function isCategoryList(value: unknown): value is AdminCategory[] {
  return Array.isArray(value);
}

/** Edit category: row plus parent candidates and locale config, server-fetched. */
export default async function AdminEditCategoryPage({ params }: EditCategoryPageProps) {
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
  const [categoryResult, categoriesResult, configResult] = await Promise.all([
    backendFetch(`/admin/categories/${encodeURIComponent(id)}`, { method: 'GET', cookieHeader }),
    backendFetch('/admin/categories', { method: 'GET', cookieHeader }),
    getPublicConfig(createApiClient()).then(
      (value) => ({ ok: true as const, value }),
      () => ({ ok: false as const }),
    ),
  ]);

  if (categoryResult.status === 404) {
    notFound();
  }
  const category =
    categoryResult.status === 200 && isCategory(categoryResult.body) ? categoryResult.body : null;
  if (category === null) {
    return (
      <Text role="alert" className="text-destructive">
        {messages.admin.loadError}
      </Text>
    );
  }
  const categories =
    categoriesResult.status === 200 && isCategoryList(categoriesResult.body)
      ? categoriesResult.body
      : [];
  const config = configResult.ok
    ? configResult.value
    : { defaultLocale: 'en', supportedLocales: ['en', 'es'] };

  return (
    <Stack gap="md">
      <Link href={`/${locale}/admin/categorias`}>
        {messages.admin.categoryForm.backToCategories}
      </Link>
      <Stack direction="horizontal" gap="md" align="center" wrap>
        <Heading level={2}>{messages.admin.categoryForm.editTitle}</Heading>
      </Stack>
      <Card>
        <CategoryEditContainer
          category={category}
          categories={categories}
          locales={config.supportedLocales}
          defaultLocale={config.defaultLocale}
          messages={messages}
        />
      </Card>
    </Stack>
  );
}
