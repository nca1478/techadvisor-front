'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { ProductForm } from '@/features/admin/components/product-form';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import {
  buildCreateRequest,
  initialStockError,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormState,
  type ProductValidationTexts,
} from '@/features/admin/lib/product-submit';
import { parseWholeUnits } from '@/features/admin/lib/admin-schemas';
import type { AdminProduct } from '@/lib/api/admin';
import type { CatalogBrand, CatalogCategory } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';

const EMPTY: ProductFormState = {
  sku: '',
  name: '',
  slug: '',
  description: '',
  brandId: '',
  categoryId: '',
  priceMajor: '',
  currency: '',
  status: 'DRAFT',
  initialStock: '0',
  specsRaw: {},
  translationLocale: '',
  translationName: '',
  translationDescription: '',
};

/**
 * Create container: holds form state, validates with the shared product
 * rules, posts to the BFF and navigates to the edit page on success so the
 * admin can add images and stock right away.
 */
export function ProductCreateContainer({
  locale,
  brands,
  categories,
  currencies,
  baseCurrency,
  locales,
  defaultLocale,
  messages,
}: {
  locale: string;
  brands: CatalogBrand[];
  categories: CatalogCategory[];
  currencies: string[];
  baseCurrency: string;
  locales: string[];
  defaultLocale: string;
  messages: Dictionary;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormState>({ ...EMPTY, currency: baseCurrency });
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
    const nextErrors: ProductFormErrors = { ...validated.errors };
    const stockError = initialStockError(values.initialStock, texts);
    if (stockError) nextErrors['initialStock'] = stockError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || validated.priceAmount === null) return;
    const initialStock = parseWholeUnits(values.initialStock, 1_000_000) ?? 0;

    setPending(true);
    setServerError(null);
    try {
      const created = await adminHttp.post<AdminProduct>(
        '/products',
        buildCreateRequest(values, validated.specs, validated.priceAmount, initialStock),
      );
      router.push(`/${locale}/admin/productos/${encodeURIComponent(created.id)}`);
      router.refresh();
    } catch (error) {
      setServerError(adminErrorMessage(error, form.createError));
    } finally {
      setPending(false);
    }
  }

  return (
    <Stack gap="md">
      <ProductForm
        mode="create"
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
      {serverError ? (
        <Text role="alert" className="text-destructive">
          {serverError}
        </Text>
      ) : null}
      <Stack direction="horizontal" gap="md">
        <Button onClick={() => void handleSubmit()} loading={pending}>
          {pending ? form.creating : form.create}
        </Button>
      </Stack>
    </Stack>
  );
}
