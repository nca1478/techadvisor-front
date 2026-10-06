import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckoutContainer } from '@/features/checkout/containers/checkout-container';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface CheckoutPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.checkout.title} — ${messages.common.techAdvisor}` };
}

/**
 * Localized checkout page. Server protection happens twice: anonymous
 * browsers are redirected to `/ingresar?next=…` by the container, and the
 * order/payment BFF handlers reject unauthenticated calls with 401.
 */
export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  return <CheckoutContainer locale={locale} messages={messages.checkout} />;
}
