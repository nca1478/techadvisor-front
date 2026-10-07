import { currencyFractionDigits } from '@/lib/money/format';
import type { ProductDetail } from '@/lib/api/catalog';

/**
 * Canonical public URL of the storefront. Read from `NEXT_PUBLIC_SITE_URL`
 * (public by necessity: it is embedded in metadata, sitemap and JSON-LD).
 * Falls back to the local dev origin so pages still render absolute
 * canonical/OG URLs without configuration.
 */
export function siteUrl(): string {
  const fromEnv = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';
  return fromEnv.replace(/\/+$/, '');
}

/** Joins a locale-less path (`/en/productos/x`) onto the canonical origin. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl()}${clean}`;
}

/**
 * Minor-units amount as a schema.org-compatible major-units number
 * (presentation-free: no locale formatting, JSON-serializable).
 */
export function majorAmount(amountMinor: number, currency: string): number {
  const digits = currencyFractionDigits(currency);
  return Number((amountMinor / 10 ** digits).toFixed(digits));
}

export interface ProductJsonLdInput {
  product: Pick<
    ProductDetail,
    'name' | 'description' | 'sku' | 'priceAmount' | 'currency' | 'inStock' | 'brand' | 'images'
  >;
  locale: string;
  path: string;
}

/**
 * Builds a schema.org `Product` node with an `offers` block (price with
 * `priceCurrency`, availability). Money comes from the SQL-backed API
 * response (`priceAmount` + `currency`), never from generated text.
 */
export function productJsonLd({
  product,
  locale,
  path,
}: ProductJsonLdInput): Record<string, unknown> {
  const images = product.images
    .map((image) => image.url)
    .filter((url): url is string => typeof url === 'string' && url.length > 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    inLanguage: locale,
    url: absoluteUrl(path),
    ...(images.length > 0 ? { image: images } : {}),
    brand: { '@type': 'Brand', name: product.brand.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency,
      price: majorAmount(product.priceAmount, product.currency),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: absoluteUrl(path),
    },
  };
}
