import { Inter, JetBrains_Mono } from 'next/font/google';

/*
 * Global typefaces (ADR 0005). Both families use the SIL Open Font License.
 * Exposed as CSS variables consumed by @theme in globals.css (--font-sans,
 * --font-mono); system fallbacks are declared there.
 */
export const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});
