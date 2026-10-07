import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { AccountOrdersView } from '@/features/account/containers/account-orders-view';
import { backendFetch } from '@/lib/api/backend';
import type { Order } from '@/lib/api/orders';
import { getSessionUser } from '@/lib/auth/session';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface OrdersPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: OrdersPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.account.ordersTitle} — ${messages.common.techAdvisor}` };
}

function isOrderList(value: unknown): value is Order[] {
  return Array.isArray(value);
}

/** Customer orders list: session-guarded, server-fetched, client-paginated. */
export default async function AccountOrdersPage({ params }: OrdersPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const session = await getSessionUser();
  if (!session.authenticated) {
    redirect(`/${locale}/ingresar?next=${encodeURIComponent(`/${locale}/cuenta/ordenes`)}`);
  }

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
  const result = await backendFetch('/orders', { method: 'GET', cookieHeader });
  const orders = result.status === 200 && isOrderList(result.body) ? result.body : null;

  return (
    <AccountOrdersView
      orders={orders}
      loadError={orders === null}
      locale={locale}
      messages={messages}
    />
  );
}
