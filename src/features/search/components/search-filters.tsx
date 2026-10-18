'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import type { CatalogCategory } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';

export interface SearchFilterValues {
  query: string;
  category: string;
  maxPriceInput: string;
}

export interface SearchFiltersProps {
  values: SearchFilterValues;
  categories: CatalogCategory[];
  messages: Dictionary['search'];
  maxPriceError?: string;
  onChange: (values: SearchFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
}

/**
 * Presentational search filters: category slug and a max price in display
 * units (converted to minor units by the container). Controlled entirely by
 * the parent; Apply/Clear rewrite the URL there.
 */
export function SearchFilters({
  values,
  categories,
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
        <Stack direction="horizontal" gap="md" align="center">
          <Button type="submit" variant="primary" size="sm">
            {messages.applyFilters}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            {messages.clearFilters}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
