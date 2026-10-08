'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import type { CatalogBrand, CatalogCategory, ProductSort } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';

export interface ProductFilterValues {
  q: string;
  category: string;
  brand: string;
  sort: ProductSort | '';
  inStockOnly: boolean;
}

export interface ProductFiltersProps {
  values: ProductFilterValues;
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  messages: Dictionary['catalog'];
  onChange: (next: ProductFilterValues) => void;
  onClear: () => void;
}

const SORT_OPTIONS: ReadonlyArray<ProductSort> = [
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
  'newest',
];

/**
 * Presentational filters bar. Emits whole-value changes; URL sync lives in the
 * container (client wrapper), never here.
 */
export function ProductFilters({
  values,
  categories,
  brands,
  messages,
  onChange,
  onClear,
}: ProductFiltersProps) {
  return (
    <form
      role="search"
      aria-label={messages.title}
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Stack gap="md">
        <Stack direction="horizontal" gap="md" wrap>
          <Input
            label={messages.searchLabel}
            name="q"
            value={values.q}
            placeholder={messages.searchPlaceholder}
            onChange={(event) => {
              onChange({ ...values, q: event.target.value });
            }}
          />
          <Select
            label={messages.categoryLabel}
            name="category"
            value={values.category}
            placeholder={messages.allCategories}
            options={categories.map((category) => ({
              value: category.slug,
              label: category.name,
            }))}
            onChange={(event) => {
              onChange({ ...values, category: event.target.value });
            }}
          />
          <Select
            label={messages.brandLabel}
            name="brand"
            value={values.brand}
            placeholder={messages.allBrands}
            options={brands.map((brand) => ({ value: brand.slug, label: brand.name }))}
            onChange={(event) => {
              onChange({ ...values, brand: event.target.value });
            }}
          />
          <Select
            label={messages.sortLabel}
            name="sort"
            value={values.sort}
            placeholder={messages.sortNone}
            options={SORT_OPTIONS.map((sort) => ({
              value: sort,
              label: messages[`sort ${sort}`],
            }))}
            onChange={(event) => {
              onChange({ ...values, sort: event.target.value as ProductSort | '' });
            }}
          />
        </Stack>
        <Stack direction="horizontal" gap="md" align="center" justify="between">
          <label
            htmlFor="in-stock-only"
            className="inline-flex items-center gap-1.5 text-sm text-foreground"
          >
            <input
              id="in-stock-only"
              type="checkbox"
              checked={values.inStockOnly}
              onChange={(event) => {
                onChange({ ...values, inStockOnly: event.target.checked });
              }}
              className="size-4 accent-primary"
            />
            {messages.inStockOnly}
          </label>
          <Button variant="ghost" size="sm" onClick={onClear}>
            {messages.clearFilters}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
