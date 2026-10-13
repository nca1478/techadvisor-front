import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { AdminOrderDetailContainer } from '@/features/admin/containers/admin-order-detail-container';
import { backendFetch } from '@/lib/api/backend';
import type { AdminOrder } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface OrderPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.orders.title} — ${messages.common.techAdvisor}` };
}

function isOrder(value: unknown): value is AdminOrder {
  return value !== null && typeof value === 'object' && 'userId' in value && 'items' in value;
}

/** Order detail: frozen items + guarded status transitions. */
export default async function AdminOrderPage({ params }: OrderPageProps) {
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
  const result = await backendFetch(`/admin/orders/${encodeURIComponent(id)}`, {
    method: 'GET',
    cookieHeader,
  });
  if (result.status === 404) {
    notFound();
  }
  const order = result.status === 200 && isOrder(result.body) ? result.body : null;
  if (order === null) {
    notFound();
  }

  return (
    <Stack gap="md">
      <Link href={`/${locale}/admin/ordenes`}>{messages.admin.orders.backToOrders}</Link>
      <AdminOrderDetailContainer initialOrder={order} locale={locale} messages={messages} />
    </Stack>
  );
}
