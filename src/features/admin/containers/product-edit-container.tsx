'use client';

import { useMemo, useState } from 'react';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { ProductForm } from '@/features/admin/components/product-form';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import { formatMinorToMajor } from '@/features/admin/lib/admin-schemas';
import {
  buildUpdateRequest,
  errorsForStep,
  firstErrorStep,
  pickInitialTranslation,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormState,
  type ProductValidationTexts,
} from '@/features/admin/lib/product-submit';
import type { ProductWizardExtraStep } from '@/features/admin/components/product-form';
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
 * `PUT .../images`. The optional translation block is prefilled with the
 * existing non-default-locale translation (if any) and sent back on save;
 * clearing it leaves the stored set untouched (the backend replaces the
 * whole set only when `translations` is present).
 */
export function ProductEditContainer({
  product,
  brands,
  categories,
  currencies,
  locales,
  defaultLocale,
  messages,
  extraSteps = [],
}: {
  product: AdminProduct;
  brands: CatalogBrand[];
  categories: CatalogCategory[];
  currencies: string[];
  locales: string[];
  defaultLocale: string;
  messages: Dictionary;
  extraSteps?: ProductWizardExtraStep[];
}) {
  const initialTranslation = pickInitialTranslation(product.translations, defaultLocale);
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
    translationLocale: initialTranslation?.locale ?? '',
    translationName: initialTranslation?.name ?? '',
    translationDescription: initialTranslation?.description ?? '',
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

  function handleValidateStep(step: number): Record<string, string> {
    const validated = validateProductForm(values, specsFields, texts);
    setErrors(validated.errors);
    return errorsForStep(validated.errors, step, 'edit');
  }

  async function handleSubmit(): Promise<number | null> {
    const validated = validateProductForm(values, specsFields, texts);
    setErrors(validated.errors);
    if (Object.keys(validated.errors).length > 0 || validated.priceAmount === null) {
      // Surface the failure in the always-visible footer and jump the
      // wizard to the first step with inline errors (otherwise the click
      // looks dead on the images/inventory steps).
      setFeedback({ ok: false, text: form.fixErrors });
      return firstErrorStep(validated.errors, 'edit');
    }

    const body = buildUpdateRequest(values, validated.specs, validated.priceAmount);
    if (body.translations !== undefined && body.translations.length === 0) {
      delete body.translations;
    }
    setPending(true);
    setFeedback(null);
    try {
      await adminHttp.patch<AdminProduct>(`/products/${encodeURIComponent(product.id)}`, body);
      setFeedback({ ok: true, text: form.updated });
      return null;
    } catch (error) {
      setFeedback({ ok: false, text: adminErrorMessage(error, form.updateError) });
      return null;
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
        onValidateStep={handleValidateStep}
        onSubmit={() => void handleSubmit()}
        pending={pending}
        submitLabel={form.save}
        submitPendingLabel={form.saving}
        extraSteps={extraSteps}
        freeNavigation
        footerNote={
          feedback ? (
            <Text
              role={feedback.ok ? 'status' : 'alert'}
              className={feedback.ok ? undefined : 'text-destructive'}
            >
              {feedback.text}
            </Text>
          ) : null
        }
        formMessages={form}
        statusLabels={messages.admin.products}
      />
    </Stack>
  );
}
