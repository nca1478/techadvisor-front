/**
 * Formats a minor-units amount in its ISO 4217 currency. Presentation-only:
 * containers pass raw `priceAmount`/`currency` through; only presentational
 * components call this helper.
 */
export function formatPrice(amountMinor: number, currency: string, locale: string): string {
  const fractionDigits = currencyFractionDigits(currency);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amountMinor / 10 ** fractionDigits);
}

/**
 * Minor-unit exponent per currency. Defaults to 2; zero-decimal currencies
 * (JPY, KRW, ...) use 0. Kept minimal for the supported list (USD, EUR);
 * extend when the backend adds more currencies.
 */
export function currencyFractionDigits(currency: string): number {
  const ZERO_DECIMAL = new Set([
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'UYI',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
  ]);
  if (ZERO_DECIMAL.has(currency.toUpperCase())) return 0;
  return 2;
}
