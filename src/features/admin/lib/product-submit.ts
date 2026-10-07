import type { CreateProductRequest, SpecField, UpdateProductRequest } from '@/lib/api/admin';
import {
  buildSpecsRecord,
  parseMajorToMinor,
  parseWholeUnits,
  slugField,
} from '@/features/admin/lib/admin-schemas';

export interface ProductFormState {
  sku: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  priceMajor: string;
  currency: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  initialStock: string;
  specsRaw: Record<string, string>;
  translationLocale: string;
  translationName: string;
  translationDescription: string;
}

export type ProductFormErrors = Partial<Record<string, string>>;

export interface ProductFormOption {
  value: string;
  label: string;
}

export interface ProductValidationTexts {
  required: string;
  slugInvalid: string;
  priceInvalid: string;
  initialStockInvalid: string;
  specsInvalidInteger: string;
  specsInvalidNumber: string;
}

export interface ValidatedProductForm {
  errors: Record<string, string>;
  specs: Record<string, unknown>;
  priceAmount: number | null;
}

/**
 * Shared create/edit validation: required base fields, slug shape, price
 * (major → minor units) and category specs coercion. Returns inline errors
 * keyed by field (`specs.<key>` for specs) plus the coerced values; the
 * container builds the request body only when `errors` is empty.
 */
export function validateProductForm(
  values: ProductFormState,
  specsFields: SpecField[],
  texts: ProductValidationTexts,
): ValidatedProductForm {
  const errors: Record<string, string> = {};
  if (values.sku.trim() === '') errors['sku'] = texts.required;
  if (values.name.trim() === '') errors['name'] = texts.required;
  if (values.description.trim() === '') errors['description'] = texts.required;
  if (values.brandId === '') errors['brandId'] = texts.required;
  if (values.categoryId === '') errors['categoryId'] = texts.required;
  if (!slugField.safeParse(values.slug).success) errors['slug'] = texts.slugInvalid;

  const priceAmount = parseMajorToMinor(values.priceMajor, values.currency || 'USD');
  if (priceAmount === null) errors['priceMajor'] = texts.priceInvalid;

  const { record, errors: specsErrors } = buildSpecsRecord(
    specsFields,
    values.specsRaw,
    texts.specsInvalidInteger,
    texts.specsInvalidNumber,
  );
  for (const [key, message] of Object.entries(specsErrors)) {
    errors[`specs.${key}`] = message;
  }
  return { errors, specs: record, priceAmount };
}

export function collectTranslations(values: ProductFormState) {
  if (
    values.translationLocale.trim() === '' ||
    values.translationName.trim() === '' ||
    values.translationDescription.trim() === ''
  ) {
    return [];
  }
  return [
    {
      locale: values.translationLocale.trim(),
      name: values.translationName.trim(),
      description: values.translationDescription.trim(),
    },
  ];
}

export function buildCreateRequest(
  values: ProductFormState,
  specs: Record<string, unknown>,
  priceAmount: number,
  initialStock: number,
): CreateProductRequest {
  return {
    sku: values.sku.trim(),
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    brandId: values.brandId,
    categoryId: values.categoryId,
    priceAmount,
    currency: values.currency,
    status: values.status,
    specs,
    translations: collectTranslations(values),
    images: [],
    initialStock,
  };
}

export function buildUpdateRequest(
  values: ProductFormState,
  specs: Record<string, unknown>,
  priceAmount: number,
): UpdateProductRequest {
  return {
    sku: values.sku.trim(),
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    brandId: values.brandId,
    categoryId: values.categoryId,
    priceAmount,
    currency: values.currency,
    specs,
    translations: collectTranslations(values),
  };
}

export function initialStockError(value: string, texts: ProductValidationTexts): string | null {
  return parseWholeUnits(value, 1_000_000) === null ? texts.initialStockInvalid : null;
}
