import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { DashboardView } from '@/features/admin/components/dashboard-view';
import { backendFetch } from '@/lib/api/backend';
import type { AdminOrderList, AdminProduct, AdminProductList } from '@/lib/api/admin';
import { isLowStock } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  params: Promise<unknown>;
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

function isProductList(value: unknown): value is AdminProductList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

/** Dashboard: recent orders + low-stock products (guard lives in layout). */
export default async function AdminDashboardPage({ params }: DashboardPageProps) {
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

  const [ordersResult, productsResult] = await Promise.all([
    backendFetch('/admin/orders?page=1&limit=5', { method: 'GET', cookieHeader }),
    backendFetch('/admin/products?page=1&limit=100', { method: 'GET', cookieHeader }),
  ]);

  const orders =
    ordersResult.status === 200 && isOrderList(ordersResult.body) ? ordersResult.body.data : [];
  const products: AdminProduct[] =
    productsResult.status === 200 && isProductList(productsResult.body)
      ? productsResult.body.data
      : [];
  const lowStock = products
    .filter(isLowStock)
    .sort((a, b) => a.stock - a.reserved - (b.stock - b.reserved))
    .slice(0, 10);

  return (
    <DashboardView
      recentOrders={orders}
      lowStock={lowStock}
      ordersError={ordersResult.status !== 200}
      productsError={productsResult.status !== 200}
      locale={locale}
      messages={messages}
    />
  );
}
