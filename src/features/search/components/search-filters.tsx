'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import type { CatalogBrand, CatalogCategory, ProductSort } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';

export interface SearchFilterValues {
  query: string;
  category: string;
  brand: string;
  sort: ProductSort | '';
  maxPriceInput: string;
  inStockOnly: boolean;
}

export interface SearchFiltersProps {
  values: SearchFilterValues;
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  messages: Dictionary['search'];
  maxPriceError?: string;
  onChange: (values: SearchFilterValues) => void;
  onApply: () => void;
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
 * Presentational search filters: category/brand slugs, explicit sort, a max
 * price in display units (converted to minor units by the container) and an
 * in-stock flag. Controlled entirely by the parent; Apply/Clear rewrite the
 * URL there. Mirrors the product listing filters; the bottom row keeps the
 * stock checkbox on the left and the clear action on the right.
 */
export function SearchFilters({
  values,
  categories,
  brands,
  messages,
  maxPriceError,
  onChange,
  onApply,
  onClear,
}: SearchFiltersProps) {
  return (
    <form
      aria-label={messages.title}
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <Stack gap="md">
        <Input
          label={messages.label}
          name="q"
          placeholder={messages.placeholder}
          value={values.query}
          onChange={(event) => {
            onChange({ ...values, query: event.target.value });
          }}
        />
        <Stack direction="horizontal" gap="md" wrap>
          {categories.length > 0 && (
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
          )}
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
          <Input
            label={messages.maxPriceLabel}
            name="max-price"
            inputMode="decimal"
            placeholder={messages.maxPricePlaceholder}
            value={values.maxPriceInput}
            error={maxPriceError}
            onChange={(event) => {
              onChange({ ...values, maxPriceInput: event.target.value });
            }}
          />
        </Stack>
        <Stack direction="horizontal" gap="md" align="center" justify="between">
          <Stack direction="horizontal" gap="md" align="center">
            <Button type="submit" variant="primary" size="sm">
              {messages.applyFilters}
            </Button>
            <label
              htmlFor="search-in-stock-only"
              className="inline-flex items-center gap-1.5 text-sm text-foreground"
            >
              <input
                id="search-in-stock-only"
                type="checkbox"
                checked={values.inStockOnly}
                onChange={(event) => {
                  onChange({ ...values, inStockOnly: event.target.checked });
                }}
                className="size-4 accent-primary"
              />
              {messages.inStockOnly}
            </label>
          </Stack>
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            {messages.clearFilters}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
