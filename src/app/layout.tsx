import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import './globals.css';
import { fontDisplay, fontMono, fontSans } from './fonts';
import { normalizeLocale } from '@/lib/i18n/config';
import { siteUrl } from '@/lib/seo/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: 'TechAdvisor',
  description: 'Tech ecommerce with a RAG-powered shopping advisor.',
};

/**
 * Root layout: `<html lang>` follows the locale prefix (`x-locale` set by
 * the middleware, defaulting to the configured default).
 *
 * Theme first paint without any blocking script: the server reads the
 * `techadvisor-theme` cookie (written by ThemeProvider on every change) and
 * stamps [data-theme] into the SSR HTML, so returning visitors get their
 * ground on first paint. Without a cookie the attribute is omitted and CSS
 * decides: ink by default, daylight via `prefers-color-scheme` (see the
 * media fallback in globals.css). `suppressHydrationWarning` covers the
 * client-side hydration of that same attribute in ThemeProvider.
 */
export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const headerList = await headers();
  const locale = normalizeLocale(headerList.get('x-locale'));
  const storedTheme = (await cookies()).get('techadvisor-theme')?.value;
  const theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : undefined;
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-theme={theme}
      style={theme ? { colorScheme: theme } : undefined}
      className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
