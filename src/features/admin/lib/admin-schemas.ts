import { z } from 'zod';
import type { SpecField } from '@/lib/api/admin';
import { currencyFractionDigits } from '@/lib/money/format';

/**
 * Client-side form validation for the back-office. Every schema mirrors the
 * backend Zod contract (`admin.schemas.ts`) field-by-field so invalid payloads
 * are rejected before the request — the backend re-validates everything.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugField = z.string().trim().min(1).max(100).regex(SLUG_PATTERN);

export function isHttpsUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.startsWith('https://')) return false;
  try {
    return new URL(trimmed).protocol === 'https:';
  } catch {
    return false;
  }
}

const requiredText = (min: number, max: number) => z.string().trim().min(min).max(max);

const baseProductFields = {
  sku: requiredText(1, 100),
  name: requiredText(1, 200),
  slug: slugField,
  description: requiredText(1, 5000),
  brandId: z.uuid(),
  categoryId: z.uuid(),
  /** Decimal string in major units (e.g. "1299.99"); converted to minor units on submit. */
  priceMajor: z.string().trim().min(1),
  currency: z.string().trim().toUpperCase().length(3),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
};

export const createProductFormSchema = z.object({
  ...baseProductFields,
  /** Whole-units string ("0", "12"); the backend default is 0. */
  initialStock: z.string().trim().min(1),
});

export const updateProductFormSchema = z.object(baseProductFields);

export type CreateProductFormValues = z.output<typeof createProductFormSchema>;
export type UpdateProductFormValues = z.output<typeof updateProductFormSchema>;

/**
 * Converts a major-units decimal string to minor units (e.g. "1299.99" with
 * 2 fraction digits → 129900). Returns null when the shape is invalid
 * (negative, too many decimals, not a number). Presentation-only helper:
 * the backend re-validates the integer.
 */
export function parseMajorToMinor(value: string, currency: string): number | null {
  const fractionDigits = currencyFractionDigits(currency);
  const trimmed = value.trim();
  const pattern =
    fractionDigits === 0
      ? /^(\d+)$/
      : new RegExp(`^(\\d+)(\\.(\\d{1,${String(fractionDigits)}}))?$`);
  const match = pattern.exec(trimmed);
  if (!match) return null;
  const [, wholePart = '0', , decimalsPart = ''] = match;
  const whole = Number.parseInt(wholePart, 10);
  const decimals = decimalsPart.padEnd(fractionDigits, '0');
  const amount =
    whole * 10 ** fractionDigits + (decimals === '' ? 0 : Number.parseInt(decimals, 10));
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > 999_999_999) return null;
  return amount;
}

/** Converts minor units back to a major-units string for editing. */
export function formatMinorToMajor(amount: number, currency: string): string {
  const fractionDigits = currencyFractionDigits(currency);
  if (fractionDigits === 0) return String(amount);
  return (amount / 10 ** fractionDigits).toFixed(fractionDigits);
}

export function parseWholeUnits(value: string, max: number): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > max) return null;
  return parsed;
}

export const productImageFieldSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .refine((url) => isHttpsUrl(url)),
  alt: z.string().trim().max(200),
});

export const productImagesFormSchema = z.object({
  images: z.array(productImageFieldSchema).max(10),
});

export type ProductImageField = z.output<typeof productImageFieldSchema>;

export const inventoryAdjustFormSchema = z.object({
  delta: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(280),
});

export function parseDelta(value: string): number | null {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isSafeInteger(parsed) || parsed === 0 || Math.abs(parsed) > 1_000_000) return null;
  return parsed;
}

export interface SpecsBuildResult {
  record: Record<string, unknown>;
  errors: Record<string, string>;
}

/**
 * Coerces raw string inputs into a `specs` record using the category field
 * definitions (`type` per key). Unknown keys are dropped (the backend
 * rejects them); empty inputs are omitted; per-field errors are keyed by
 * field key so the form can render them inline.
 */
export function buildSpecsRecord(
  fields: SpecField[],
  raw: Record<string, string>,
  invalidInteger: string,
  invalidNumber: string,
): SpecsBuildResult {
  const record: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = (raw[field.key] ?? '').trim();
    if (value === '') continue;
    switch (field.type) {
      case 'string': {
        record[field.key] = value;
        break;
      }
      case 'integer': {
        if (!/^-?\d+$/.test(value)) {
          errors[field.key] = invalidInteger;
        } else {
          record[field.key] = Number.parseInt(value, 10);
        }
        break;
      }
      case 'number': {
        const parsed = Number(value);
        if (value === '' || !Number.isFinite(parsed)) {
          errors[field.key] = invalidNumber;
        } else {
          record[field.key] = parsed;
        }
        break;
      }
      case 'boolean': {
        if (value === 'true') record[field.key] = true;
        else if (value === 'false') record[field.key] = false;
        else errors[field.key] = invalidNumber;
        break;
      }
      case 'enum': {
        if (field.options?.includes(value)) {
          record[field.key] = value;
        } else {
          errors[field.key] = invalidNumber;
        }
        break;
      }
    }
  }
  return { record, errors };
}
