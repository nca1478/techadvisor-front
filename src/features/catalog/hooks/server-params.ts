import type { PublicConfig } from '@/lib/api/index';

/** Server-side currency resolution: `?currency=` wins when supported, else base. */
export function resolveCurrency(
  searchParams: Record<string, string | string[] | undefined>,
  config: PublicConfig | null,
): string {
  const supported = config?.supportedCurrencies ?? [];
  const fallback = config?.baseCurrency ?? 'USD';
  const raw = searchParams['currency'];
  const requested = Array.isArray(raw) ? raw[0] : raw;
  if (requested && (supported.length === 0 || supported.includes(requested))) return requested;
  return fallback;
}

export function firstParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const raw = searchParams[key];
  if (Array.isArray(raw)) return raw[0] ?? '';
  return raw ?? '';
}
