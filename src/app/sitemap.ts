import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/seo/site';
import type { PaginatedProducts } from '@/lib/api/catalog';

// Refreshed hourly (see docs/decisions/0009-seo-isr.md): new products become
// visible to crawlers without a redeploy.
export const revalidate = 3600;

function apiBaseUrl(): string {
  const fromEnv =
    process.env['API_BASE_URL'] ??
    process.env['NEXT_PUBLIC_API_BASE_URL'] ??
    'http://localhost:3001/api/v1';
  return fromEnv.replace(/\/+$/, '');
}

interface SitemapProduct {
  slug: string;
  createdAt?: string;
}

async function fetchProductSlugs(): Promise<SitemapProduct[]> {
  const res = await fetch(`${apiBaseUrl()}/catalog/products?limit=100`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const body = (await res.json()) as PaginatedProducts;
  if (!Array.isArray(body.data)) return [];
  return body.data
    .filter((product) => typeof product.slug === 'string')
    .map((product) => ({ slug: product.slug, createdAt: product.createdAt }));
}

/**
 * Sitemap from the live catalog (slugs + `createdAt` as `lastModified`).
 * Degrades to locale home/listing entries when the API is unreachable, so a
 * backend outage never breaks `/sitemap.xml` itself.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '',
    '/productos',
    '/carrito',
    '/checkout',
    '/ingresar',
    '/registro',
    '/cuenta',
    '/soporte',
  ];
  const entries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: absoluteUrl(`/${locale}${path}`),
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.6,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((code) => [code, absoluteUrl(`/${code}${path}`)]),
        ),
      },
    })),
  );

  let products: SitemapProduct[] = [];
  try {
    products = await fetchProductSlugs();
  } catch {
    products = [];
  }

  for (const product of products) {
    for (const locale of LOCALES) {
      entries.push({
        url: absoluteUrl(`/${locale}/productos/${product.slug}`),
        ...(product.createdAt ? { lastModified: product.createdAt } : {}),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((code) => [code, absoluteUrl(`/${code}/productos/${product.slug}`)]),
          ),
        },
      });
    }
  }

  return entries;
}
