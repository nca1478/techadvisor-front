import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  AdminProductsView,
  type AdminProductsQuery,
} from '@/features/admin/containers/admin-products-view';
import { backendFetch } from '@/lib/api/backend';
import type { AdminProductList, AdminProductStatus } from '@/lib/api/admin';
import { toAdminQuery } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.products.title} — ${messages.common.techAdvisor}` };
}

const STATUSES: AdminProductStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

function firstParam(query: Record<string, unknown>, key: string): string {
  const value = query[key];
  return typeof value === 'string' ? value : '';
}

function isProductList(value: unknown): value is AdminProductList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

/** Products list: URL-driven status/search/pagination, server-fetched. */
export default async function AdminProductsPage({ params, searchParams }: ProductsPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const queryParams = ((await searchParams) ?? {}) as Record<string, unknown>;

  const rawStatus = firstParam(queryParams, 'status');
  const status: AdminProductsQuery['status'] = (STATUSES as readonly string[]).includes(rawStatus)
    ? (rawStatus as AdminProductStatus)
    : '';
  const q = firstParam(queryParams, 'q');
  const page = Math.max(1, Number.parseInt(firstParam(queryParams, 'page'), 10) || 1);

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const search = toAdminQuery({
    ...(status === '' ? {} : { status }),
    ...(q === '' ? {} : { q }),
    page,
    limit: 10,
  });
  const result = await backendFetch(`/admin/products${search}`, { method: 'GET', cookieHeader });
  const data = result.status === 200 && isProductList(result.body) ? result.body : null;

  return (
    <AdminProductsView
      data={data}
      loadError={data === null}
      query={{ status, q, page }}
      locale={locale}
      messages={messages}
    />
  );
}
