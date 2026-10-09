import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  AdminOrdersView,
  type AdminOrdersQuery,
} from '@/features/admin/containers/admin-orders-view';
import { backendFetch } from '@/lib/api/backend';
import type { AdminOrderList } from '@/lib/api/admin';
import { toAdminQuery } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface OrdersPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: OrdersPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.orders.title} — ${messages.common.techAdvisor}` };
}

const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

function firstParam(query: Record<string, unknown>, key: string): string {
  const value = query[key];
  return typeof value === 'string' ? value : '';
}

function isOrderList(value: unknown): value is AdminOrderList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

/** Orders list: URL-driven status filter + pagination, server-fetched. */
export default async function AdminOrdersPage({ params, searchParams }: OrdersPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const queryParams = ((await searchParams) ?? {}) as Record<string, unknown>;

  const rawStatus = firstParam(queryParams, 'status');
  const status: AdminOrdersQuery['status'] = ORDER_STATUSES.includes(rawStatus) ? rawStatus : '';
  const page = Math.max(1, Number.parseInt(firstParam(queryParams, 'page'), 10) || 1);

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const search = toAdminQuery({
    ...(status === '' ? {} : { status }),
    page,
    limit: 10,
  });
  const result = await backendFetch(`/admin/orders${search}`, { method: 'GET', cookieHeader });
  const data = result.status === 200 && isOrderList(result.body) ? result.body : null;

  return (
    <AdminOrdersView
      data={data}
      loadError={data === null}
      query={{ status, page }}
      locale={locale}
      messages={messages}
    />
  );
}
