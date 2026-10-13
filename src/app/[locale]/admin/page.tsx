import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { DashboardView } from '@/features/admin/components/dashboard-view';
import { backendFetch } from '@/lib/api/backend';
import type { AdminOrderList } from '@/lib/api/admin';
import { LOW_STOCK_THRESHOLD } from '@/lib/api/admin';
import {
  attentionTotal,
  DASHBOARD_RECENT_COUNT,
  formatBucketLabel,
  isMetricsOverview,
  parseDashboardRange,
  rangeBounds,
  rangeGranularity,
  type MetricsOverview,
} from '@/features/admin/lib/dashboard-stats';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.dashboard.title} — ${messages.common.techAdvisor}` };
}

function isOrderList(value: unknown): value is AdminOrderList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

/**
 * Dashboard: recent orders table + exact KPIs/chart/queue from
 * `GET /admin/metrics/overview` (guard lives in layout; see ADR 0037).
 */
export default async function AdminDashboardPage({ params, searchParams }: DashboardPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const query = (await searchParams) as { range?: unknown };
  const range = parseDashboardRange(query.range);
  const bounds = rangeBounds(range, new Date());

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const overviewPath =
    `/admin/metrics/overview?from=${encodeURIComponent(bounds.from)}` +
    `&to=${encodeURIComponent(bounds.to)}` +
    `&granularity=${rangeGranularity(range)}` +
    `&lowStockThreshold=${String(LOW_STOCK_THRESHOLD)}`;
  const [ordersResult, overviewResult] = await Promise.all([
    backendFetch(`/admin/orders?page=1&limit=${String(DASHBOARD_RECENT_COUNT)}`, {
      method: 'GET',
      cookieHeader,
    }),
    backendFetch(overviewPath, { method: 'GET', cookieHeader }),
  ]);

  const orders =
    ordersResult.status === 200 && isOrderList(ordersResult.body) ? ordersResult.body.data : [];
  const overview: MetricsOverview | null =
    overviewResult.status === 200 && isMetricsOverview(overviewResult.body)
      ? overviewResult.body
      : null;

  const revenue = overview?.revenue[0] ?? null;
  const ticket =
    revenue !== null && revenue.count > 0 ? Math.round(revenue.amount / revenue.count) : null;
  const attention = attentionTotal({
    outOfStock: overview?.attention.outOfStock ?? 0,
    lowStock: overview?.attention.lowStock ?? 0,
    pendingReviews: overview?.attention.pendingReviews ?? null,
    failedDocs: overview?.attention.failedDocs ?? null,
    openUnanswered: overview?.attention.openUnanswered ?? null,
  });

  return (
    <DashboardView
      recentOrders={orders}
      ordersError={ordersResult.status !== 200}
      ordersTotal={overview?.ordersTotal ?? null}
      revenueAmount={revenue?.amount ?? 0}
      revenueCurrency={revenue?.currency ?? null}
      revenueCount={revenue?.count ?? 0}
      avgTicket={ticket}
      lowStockCount={overview?.attention.lowStock ?? null}
      outOfStockCount={overview?.attention.outOfStock ?? null}
      pendingReviews={overview?.attention.pendingReviews ?? null}
      failedDocs={overview?.attention.failedDocs ?? null}
      openUnanswered={overview?.attention.openUnanswered ?? null}
      overviewError={overview === null}
      attentionTotal={attention.total}
      attentionPartial={attention.partial || overview === null}
      range={range}
      salesBuckets={(overview?.buckets ?? []).map((bucket) => ({
        key: bucket.key,
        label: formatBucketLabel(bucket.key, range, locale),
        amount: bucket.amount,
      }))}
      salesCurrency={overview?.bucketCurrency ?? null}
      locale={locale}
      messages={messages}
    />
  );
}
