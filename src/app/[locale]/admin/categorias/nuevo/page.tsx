import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { CategoryCreateContainer } from '@/features/admin/containers/category-create-container';
import { backendFetch } from '@/lib/api/backend';
import type { AdminCategory } from '@/lib/api/admin';
import { createApiClient } from '@/lib/api/client';
import { getPublicConfig } from '@/lib/api/index';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface NewCategoryPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: NewCategoryPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.categoryForm.newTitle} — ${messages.common.techAdvisor}` };
}

function isCategoryList(value: unknown): value is AdminCategory[] {
  return Array.isArray(value);
}

/** New category: parent candidates plus locale config are server-fetched. */
export default async function AdminNewCategoryPage({ params }: NewCategoryPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const [categoriesResult, configResult] = await Promise.all([
    backendFetch('/admin/categories', { method: 'GET', cookieHeader }),
    getPublicConfig(createApiClient()).then(
      (value) => ({ ok: true as const, value }),
      () => ({ ok: false as const }),
    ),
  ]);
  const categories =
    categoriesResult.status === 200 && isCategoryList(categoriesResult.body)
      ? categoriesResult.body
      : null;
  const config = configResult.ok
    ? configResult.value
    : { defaultLocale: 'en', supportedLocales: ['en', 'es'] };

  return (
    <Stack gap="md">
      <Link href={`/${locale}/admin/categorias`}>
        {messages.admin.categoryForm.backToCategories}
      </Link>
      <Stack gap="sm">
        <Heading level={2}>{messages.admin.categoryForm.newTitle}</Heading>
        <Text tone="muted">{messages.admin.categoryForm.newSubtitle}</Text>
      </Stack>
      {categories === null ? (
        <Text role="alert" className="text-destructive">
          {messages.admin.loadError}
        </Text>
      ) : (
        <Card>
          <CategoryCreateContainer
            locale={locale}
            categories={categories}
            locales={config.supportedLocales}
            defaultLocale={config.defaultLocale}
            messages={messages}
          />
        </Card>
      )}
    </Stack>
  );
}
