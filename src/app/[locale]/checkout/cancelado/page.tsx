import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OrderStatusView } from '@/features/checkout/components/order-status-view';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface StatusPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

function resolveOrderId(value: unknown): string | null {
  const raw = (value as { orderId?: unknown } | null)?.orderId;
  const candidate = Array.isArray(raw) ? (raw[0] as unknown) : raw;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
}

export async function generateMetadata({ params }: StatusPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.status.cancelledTitle} — ${messages.common.techAdvisor}` };
}

/**
 * Localized payment-cancel page. Reads the real order (`?orderId=`) so the
 * copy reflects its state; a still-`PENDING_PAYMENT` order offers paying
 * again instead of assuming it was cancelled.
 */
export default async function CheckoutCancelledPage({ params, searchParams }: StatusPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const orderId = resolveOrderId((await searchParams) ?? {});
  const messages = await getDictionary(locale);
  return <OrderStatusView orderId={orderId} locale={locale} messages={messages.status} />;
}
