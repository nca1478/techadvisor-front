import { type ApiClient, createApiClient } from './client';
import type { components } from './schema';

export type ProductListItem = components['schemas']['ProductListItemDto'];
export type ProductDetail = components['schemas']['ProductDetailDto'];
export type PaginatedProducts = components['schemas']['PaginatedProductsDto'];
export type CatalogCategory = components['schemas']['CatalogCategoryDto'];
export type CatalogBrand = components['schemas']['CatalogBrandDto'];
export type ProductImage = components['schemas']['ProductImageDto'];

export type ProductSort = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';

export interface ListProductsParams {
  page?: number;
  limit?: number;
  sort?: ProductSort;
  q?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  locale?: string;
}

function toQuery(params: ListProductsParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query === '' ? '' : `?${query}`;
}

/** openapi-typescript emits `Record<string, never> | null` for nullable strings. */
export function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function productImageAlt(image: { alt: unknown }, productName: string): string {
  return nullableString(image.alt) ?? productName;
}

export function primaryImage(product: Pick<ProductListItem, 'imageUrl' | 'imageAlt' | 'name'>): {
  src: string | null;
  alt: string;
} {
  return {
    src: nullableString(product.imageUrl),
    alt: nullableString(product.imageAlt) ?? product.name,
  };
}

/**
 * Catalog reads against the generated OpenAPI contract. Errors keep the
 * backend uniform `{ statusCode, code, message }` shape via `ApiError`.
 */
export function createCatalogApi(client: ApiClient = createApiClient()) {
  return {
    listProducts: (params: ListProductsParams = {}) =>
      client.get<PaginatedProducts>(`/catalog/products${toQuery(params)}`),
    productDetail: (slug: string, locale?: string) =>
      client.get<ProductDetail>(
        `/catalog/products/${encodeURIComponent(slug)}${locale ? `?locale=${encodeURIComponent(locale)}` : ''}`,
      ),
    listCategories: (locale?: string) =>
      client.get<CatalogCategory[]>(
        `/catalog/categories${locale ? `?locale=${encodeURIComponent(locale)}` : ''}`,
      ),
    listBrands: () => client.get<CatalogBrand[]>('/catalog/brands'),
  };
}

export type CatalogApi = ReturnType<typeof createCatalogApi>;
