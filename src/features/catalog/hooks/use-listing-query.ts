'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ProductFilterValues } from '../components/product-filters';
import type { ProductSort } from '@/lib/api/catalog';

const DEFAULT_LIMIT = 12;

export interface ListingQuery extends ProductFilterValues {
  page: number;
  sort: ProductSort | '';
}

/** Parses the listing URL query into filter values (defaults included). */
export function parseListingQuery(searchParams: URLSearchParams): ListingQuery {
  const sort = searchParams.get('sort') ?? '';
  return {
    q: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '',
    brand: searchParams.get('brand') ?? '',
    sort: (['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest'] as const).includes(
      sort as ProductSort,
    )
      ? (sort as ProductSort)
      : '',
    inStockOnly: searchParams.get('inStock') === '1',
    page: Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1),
  };
}

export function serializeListingQuery(values: ListingQuery): string {
  const search = new URLSearchParams();
  if (values.q) search.set('q', values.q);
  if (values.category) search.set('category', values.category);
  if (values.brand) search.set('brand', values.brand);
  if (values.sort) search.set('sort', values.sort);
  if (values.inStockOnly) search.set('inStock', '1');
  if (values.page > 1) search.set('page', String(values.page));
  const query = search.toString();
  return query === '' ? '' : `?${query}`;
}

/**
 * Client-side URL sync for the listing filters: every change (debounced for
 * search by the caller if needed) replaces the URL so filters survive reload.
 */
export function useListingQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(
    () => parseListingQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const update = useCallback(
    (next: Partial<ListingQuery>) => {
      const merged: ListingQuery = {
        ...values,
        ...next,
        page:
          next.page ??
          (next.q !== undefined || next.category !== undefined || next.brand !== undefined
            ? 1
            : values.page),
      };
      // Any filter change resets to page 1; explicit page changes keep filters.
      if (
        next.page === undefined &&
        (next.q !== undefined ||
          next.category !== undefined ||
          next.brand !== undefined ||
          next.sort !== undefined ||
          next.inStockOnly !== undefined)
      ) {
        merged.page = 1;
      }
      router.replace(`${pathname}${serializeListingQuery(merged)}`, { scroll: false });
    },
    [pathname, router, values],
  );

  return { values, update };
}

export { DEFAULT_LIMIT };
