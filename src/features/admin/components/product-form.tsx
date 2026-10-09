'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type {
  ProductFormErrors,
  ProductFormOption,
  ProductFormState,
} from '@/features/admin/lib/product-submit';
import type { SpecField } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Presentational product form. All state lives in the container; specs
 * fields render dynamically from the selected category definitions
 * (`SpecFieldDto` from `GET /catalog/categories`).
 */
export function ProductForm({
  mode,
  values,
  errors,
  brands,
  categories,
  specsFields,
  currencies,
  defaultLocale,
  locales,
  onChange,
  formMessages,
  statusLabels,
}: {
  mode: 'create' | 'edit';
  values: ProductFormState;
  errors: ProductFormErrors;
  brands: ProductFormOption[];
  categories: ProductFormOption[];
  specsFields: SpecField[];
  currencies: string[];
  defaultLocale: string;
  locales: string[];
  onChange: (patch: Partial<ProductFormState>) => void;
  formMessages: Dictionary['admin']['productForm'];
  statusLabels: Dictionary['admin']['products'];
}) {
  const set = (patch: Partial<ProductFormState>) => {
    onChange(patch);
  };
  const setSpec = (key: string, value: string) => {
    onChange({ specsRaw: { ...values.specsRaw, [key]: value } });
  };
  const otherLocales = locales.filter((locale) => locale !== defaultLocale);

  return (
    <Stack gap="md">
      <Stack direction="horizontal" gap="md" wrap>
        <div className="min-w-52 flex-1">
          <Input
            label={formMessages.sku}
            name="sku"
            value={values.sku}
            error={errors['sku']}
            onChange={(event) => {
              set({ sku: event.target.value });
            }}
          />
        </div>
        <div className="min-w-52 flex-1">
          <Input
            label={formMessages.slug}
            name="slug"
            value={values.slug}
            hint={formMessages.slugHint}
            error={errors['slug']}
            onChange={(event) => {
              set({ slug: event.target.value });
            }}
          />
        </div>
      </Stack>
      <Input
        label={formMessages.name}
        name="name"
        value={values.name}
        error={errors['name']}
        onChange={(event) => {
          set({ name: event.target.value });
        }}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          {formMessages.description}
        </label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          rows={4}
          aria-invalid={errors['description'] ? true : undefined}
          onChange={(event) => {
            set({ description: event.target.value });
          }}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        {errors['description'] ? (
          <p role="alert" className="text-sm text-destructive">
            {errors['description']}
          </p>
        ) : null}
      </div>
      <Stack direction="horizontal" gap="md" wrap>
        <div className="min-w-52 flex-1">
          <Select
            label={formMessages.brand}
            name="brandId"
            value={values.brandId}
            options={brands}
            placeholder={formMessages.selectBrand}
            error={errors['brandId']}
            onChange={(event) => {
              set({ brandId: event.target.value });
            }}
          />
        </div>
        <div className="min-w-52 flex-1">
          <Select
            label={formMessages.category}
            name="categoryId"
            value={values.categoryId}
            options={categories}
            placeholder={formMessages.selectCategory}
            error={errors['categoryId']}
            onChange={(event) => {
              set({ categoryId: event.target.value, specsRaw: {} });
            }}
          />
        </div>
      </Stack>
      <Stack direction="horizontal" gap="md" wrap>
        <div className="min-w-52 flex-1">
          <Input
            label={formMessages.price}
            name="priceMajor"
            inputMode="decimal"
            value={values.priceMajor}
            hint={formMessages.priceHint.replace('{currency}', values.currency || '—')}
            error={errors['priceMajor']}
            onChange={(event) => {
              set({ priceMajor: event.target.value });
            }}
          />
        </div>
        <div className="min-w-52 flex-1">
          <Select
            label={formMessages.currency}
            name="currency"
            value={values.currency}
            options={currencies.map((currency) => ({ value: currency, label: currency }))}
            error={errors['currency']}
            onChange={(event) => {
              set({ currency: event.target.value });
            }}
          />
        </div>
        {mode === 'create' ? (
          <div className="min-w-52 flex-1">
            <Select
              label={formMessages.status}
              name="status"
              value={values.status}
              options={(['DRAFT', 'ACTIVE', 'ARCHIVED'] as const).map((status) => ({
                value: status,
                label: statusLabels[`status_${status}` as keyof typeof statusLabels],
              }))}
              onChange={(event) => {
                set({ status: event.target.value as ProductFormState['status'] });
              }}
            />
          </div>
        ) : null}
        {mode === 'create' ? (
          <div className="min-w-52 flex-1">
            <Input
              label={formMessages.initialStock}
              name="initialStock"
              inputMode="numeric"
              value={values.initialStock}
              hint={formMessages.initialStockHint}
              error={errors['initialStock']}
              onChange={(event) => {
                set({ initialStock: event.target.value });
              }}
            />
          </div>
        ) : null}
      </Stack>
      <Stack gap="sm">
        <Text variant="lead" as="div">
          {formMessages.specsTitle}
        </Text>
        <Text variant="small" tone="muted">
          {formMessages.specsSubtitle}
        </Text>
        {specsFields.length === 0 ? null : (
          <Stack gap="sm">
            {specsFields.map((field) => {
              const error = errors[`specs.${field.key}`];
              const label = field.unit ? `${field.label} (${field.unit})` : field.label;
              if (field.type === 'boolean') {
                return (
                  <Select
                    key={field.key}
                    label={label}
                    name={`specs.${field.key}`}
                    value={values.specsRaw[field.key] ?? ''}
                    options={[
                      { value: 'true', label: 'true' },
                      { value: 'false', label: 'false' },
                    ]}
                    placeholder="—"
                    error={error}
                    onChange={(event) => {
                      setSpec(field.key, event.target.value);
                    }}
                  />
                );
              }
              if (field.type === 'enum') {
                return (
                  <Select
                    key={field.key}
                    label={label}
                    name={`specs.${field.key}`}
                    value={values.specsRaw[field.key] ?? ''}
                    options={(field.options ?? []).map((option) => ({
                      value: option,
                      label: option,
                    }))}
                    placeholder="—"
                    error={error}
                    onChange={(event) => {
                      setSpec(field.key, event.target.value);
                    }}
                  />
                );
              }
              return (
                <Input
                  key={field.key}
                  label={label}
                  name={`specs.${field.key}`}
                  inputMode={field.type === 'string' ? 'text' : 'decimal'}
                  value={values.specsRaw[field.key] ?? ''}
                  error={error}
                  onChange={(event) => {
                    setSpec(field.key, event.target.value);
                  }}
                />
              );
            })}
          </Stack>
        )}
      </Stack>
      {otherLocales.length > 0 ? (
        <Stack gap="sm">
          <Text variant="lead" as="div">
            {formMessages.translationTitle}
          </Text>
          <Text variant="small" tone="muted">
            {formMessages.translationSubtitle}
          </Text>
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-52 flex-1">
              <Select
                label={formMessages.translationLocale}
                name="translationLocale"
                value={values.translationLocale}
                options={otherLocales.map((locale) => ({ value: locale, label: locale }))}
                placeholder="—"
                onChange={(event) => {
                  set({ translationLocale: event.target.value });
                }}
              />
            </div>
            <div className="min-w-52 flex-1">
              <Input
                label={formMessages.translationName}
                name="translationName"
                value={values.translationName}
                onChange={(event) => {
                  set({ translationName: event.target.value });
                }}
              />
            </div>
          </Stack>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="translationDescription" className="text-sm font-medium text-foreground">
              {formMessages.translationDescription}
            </label>
            <textarea
              id="translationDescription"
              name="translationDescription"
              value={values.translationDescription}
              rows={3}
              onChange={(event) => {
                set({ translationDescription: event.target.value });
              }}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
        </Stack>
      ) : null}
    </Stack>
  );
}
