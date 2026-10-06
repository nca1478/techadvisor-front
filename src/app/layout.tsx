import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { fontMono, fontSans } from './fonts';
import { normalizeLocale } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: 'TechAdvisor',
  description: 'Tech ecommerce with a RAG-powered shopping advisor.',
};

/**
 * Root layout: `<html lang>` follows the locale prefix (`x-locale` set by
 * the middleware, defaulting to the configured default).
 */
export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const headerList = await headers();
  const locale = normalizeLocale(headerList.get('x-locale'));
  return (
    <html lang={locale} className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
