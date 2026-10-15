import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
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
 * The inline theme script paints [data-theme] before first paint (stored
 * choice wins, OS daylight is the fallback, lab dark is the default), so
 * the toggle never flashes. `suppressHydrationWarning` covers the
 * client-side hydration of that same attribute in ThemeProvider.
 */
const THEME_INIT_SCRIPT = `(function(){try{var k='techadvisor-theme';var s=null;try{s=localStorage.getItem(k)}catch(e){}var t=(s==='dark'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`;

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const headerList = await headers();
  const locale = normalizeLocale(headerList.get('x-locale'));
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
      />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
