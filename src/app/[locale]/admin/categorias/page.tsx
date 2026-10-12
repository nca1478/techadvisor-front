import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { AdminCategoriesView } from '@/features/admin/containers/admin-categories-view';
import { backendFetch } from '@/lib/api/backend';
import type { AdminCategory } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface CategoriesPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: CategoriesPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.categories.title} — ${messages.common.techAdvisor}` };
}

function isCategoryList(value: unknown): value is AdminCategory[] {
  return Array.isArray(value);
}

/** Categories list: whole set, server-fetched (no pagination on this endpoint). */
export default async function AdminCategoriesPage({ params }: CategoriesPageProps) {
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
  const result = await backendFetch('/admin/categories', { method: 'GET', cookieHeader });
  const data = result.status === 200 && isCategoryList(result.body) ? result.body : null;

  return (
    <AdminCategoriesView
      data={data}
      loadError={data === null}
      locale={locale}
      messages={messages}
    />
  );
}
