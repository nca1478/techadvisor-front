import { Chakra_Petch, Inter, JetBrains_Mono } from 'next/font/google';

/*
 * Global typefaces (ADR 0005, retema 0043 Signal Lab).
 * - Display: Chakra Petch — squared technical voice for headings, hero and
 *   section titles. Chosen over the saturated defaults (Space Grotesk, Syne,
 *   Fraunces…) for a lab-instrument character that fits a spec-driven store.
 * - Sans: Inter — body workhorse only, never display.
 * - Mono: JetBrains Mono — prices, specs and measurements (data, not costume).
 * All families use the SIL Open Font License. Exposed as CSS variables
 * consumed by @theme in globals.css (--font-display, --font-sans,
 * --font-mono); system fallbacks are declared there.
 */
export const fontDisplay = Chakra_Petch({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-chakra-petch',
});

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
