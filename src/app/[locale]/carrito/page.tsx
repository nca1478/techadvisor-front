import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CartPageContainer } from '@/features/cart/containers/cart-page-container';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface CartPageProps {
  params: Promise<unknown>;
}

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.cart.title} — ${messages.common.techAdvisor}` };
}

/** Localized cart page (guest + authenticated; totals from the server). */
export default async function CartPage({ params }: CartPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  return <CartPageContainer locale={locale} messages={messages.cart} />;
}
