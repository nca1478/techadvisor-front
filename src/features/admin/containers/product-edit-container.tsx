'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { ProductForm } from '@/features/admin/components/product-form';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import { formatMinorToMajor } from '@/features/admin/lib/admin-schemas';
import {
  buildUpdateRequest,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormState,
  type ProductValidationTexts,
} from '@/features/admin/lib/product-submit';
import type { AdminProduct } from '@/lib/api/admin';
import type { CatalogBrand, CatalogCategory } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';

function specsToRaw(specs: Record<string, unknown>): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(specs)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      raw[key] = String(value);
    }
  }
  return raw;
}

/**
 * Edit container: base fields via `PATCH /admin/products/:id`. Status moves
 * through its own endpoint (see `ProductStatusContainer`) and images through
 * `PUT .../images`, so `translations` are only sent when the admin fills the
 * optional translation block — otherwise the existing set is left untouched
 * (the backend replaces the whole set when present).
 */
export function ProductEditContainer({
  product,
  brands,
  categories,
  currencies,
  locales,
  defaultLocale,
  messages,
}: {
  product: AdminProduct;
  brands: CatalogBrand[];
  categories: CatalogCategory[];
  currencies: string[];
  locales: string[];
  defaultLocale: string;
  messages: Dictionary;
}) {
  const [values, setValues] = useState<ProductFormState>(() => ({
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brandId: product.brandId,
    categoryId: product.categoryId,
    priceMajor: formatMinorToMajor(product.priceAmount, product.currency),
    currency: product.currency,
    status: product.status,
    initialStock: '0',
    specsRaw: specsToRaw(product.specs),
    translationLocale: '',
    translationName: '',
    translationDescription: '',
  }));
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const form = messages.admin.productForm;
  const texts: ProductValidationTexts = useMemo(
    () => ({
      required: messages.admin.required,
      slugInvalid: form.slugInvalid,
      priceInvalid: form.priceInvalid,
      initialStockInvalid: form.initialStockInvalid,
      specsInvalidInteger: form.specsInvalidInteger,
      specsInvalidNumber: form.specsInvalidNumber,
    }),
    [messages.admin.required, form],
  );

  const specsFields = useMemo(
    () => categories.find((category) => category.id === values.categoryId)?.specsSchema ?? [],
    [categories, values.categoryId],
  );

  async function handleSubmit() {
    const validated = validateProductForm(values, specsFields, texts);
    setErrors(validated.errors);
    if (Object.keys(validated.errors).length > 0 || validated.priceAmount === null) return;

    const body = buildUpdateRequest(values, validated.specs, validated.priceAmount);
    if (body.translations !== undefined && body.translations.length === 0) {
      delete body.translations;
    }
    setPending(true);
    setFeedback(null);
    try {
      await adminHttp.patch<AdminProduct>(`/products/${encodeURIComponent(product.id)}`, body);
      setFeedback({ ok: true, text: form.updated });
    } catch (error) {
      setFeedback({ ok: false, text: adminErrorMessage(error, form.updateError) });
    } finally {
      setPending(false);
    }
  }

  return (
    <Stack gap="md">
      <ProductForm
        mode="edit"
        values={values}
        errors={errors}
        brands={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
        categories={categories.map((category) => ({ value: category.id, label: category.name }))}
        specsFields={specsFields}
        currencies={currencies}
        defaultLocale={defaultLocale}
        locales={locales}
        onChange={(patch) => {
          setValues((prev) => ({ ...prev, ...patch }));
        }}
        formMessages={form}
        statusLabels={messages.admin.products}
      />
      {feedback ? (
        <Text
          role={feedback.ok ? 'status' : 'alert'}
          className={feedback.ok ? undefined : 'text-destructive'}
        >
          {feedback.text}
        </Text>
      ) : null}
      <div>
        <Button onClick={() => void handleSubmit()} loading={pending}>
          {pending ? messages.admin.saving : messages.admin.save}
        </Button>
      </div>
    </Stack>
  );
}
