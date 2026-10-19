import { type ApiClient, createApiClient } from './client';
import type { components } from './schema';

export type SearchResult = components['schemas']['SearchResultDto'];
export type SearchResponse = components['schemas']['SearchResponseDto'];
export type SearchProduct = SearchResult['product'];

export type SearchSort = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';

export interface SearchParams {
  q: string;
  category?: string;
  brand?: string;
  sort?: SearchSort;
  /** Same `1` flag as the product listing: only products in stock. */
  inStock?: string;
  maxPrice?: number;
  currency?: string;
  locale?: string;
  limit?: number;
}

function toQuery(params: SearchParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query === '' ? '' : `?${query}`;
}

/**
 * Natural-language catalog search against the generated OpenAPI contract.
 * Errors keep the backend uniform `{ statusCode, code, message }` shape via
 * `ApiError`. Prices, stock and images in the response come from SQL.
 */
export function createSearchApi(client: ApiClient = createApiClient()) {
  return {
    search: (params: SearchParams) => client.get<SearchResponse>(`/search${toQuery(params)}`),
  };
}

export type SearchApi = ReturnType<typeof createSearchApi>;
