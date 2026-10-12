import { notFound, redirect } from 'next/navigation';
import { isLocale, LOCALES } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface OrdersRedirectProps {
  params: Promise<unknown>;
}

/**
 * Legacy orders URL: the account page now shows profile (default) and orders
 * as tabs, so this route redirects to the orders tab. Order detail URLs
 * (`/cuenta/ordenes/[id]`) are untouched.
 */
export default async function AccountOrdersRedirect({ params }: OrdersRedirectProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  redirect(`/${resolved.locale}/cuenta?tab=pedidos`);
}
