/**
 * ISO 3166-1 alpha-2 country codes offered in the shipping form. Names are
 * resolved at render time with `Intl.DisplayNames`, so the selector is
 * localized without duplicating country lists per language.
 */
export const COUNTRY_CODES = [
  'AR',
  'AT',
  'AU',
  'BE',
  'BO',
  'BR',
  'CA',
  'CH',
  'CL',
  'CN',
  'CO',
  'CR',
  'CZ',
  'DE',
  'DK',
  'DO',
  'EC',
  'ES',
  'FI',
  'FR',
  'GB',
  'GR',
  'GT',
  'HN',
  'IE',
  'IL',
  'IN',
  'IT',
  'JP',
  'KR',
  'MX',
  'NL',
  'NO',
  'NZ',
  'PA',
  'PE',
  'PL',
  'PR',
  'PT',
  'PY',
  'SE',
  'SG',
  'US',
  'UY',
  'VE',
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

/** Localized `{ value, label }` options for a native select. */
export function countryOptions(locale: string): Array<{ value: string; label: string }> {
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  return COUNTRY_CODES.map((code) => ({ value: code, label: names.of(code) ?? code }));
}
