/**
 * Locale configuration. The supported list mirrors the backend
 * `GET /config/public` contract (`supportedLocales`); the frontend never
 * hardcodes business locale lists elsewhere — use these helpers plus the
 * runtime public config when a dynamic check is needed.
 */
export const LOCALES = ['en', 'es'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
