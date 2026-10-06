import { z } from 'zod';

/**
 * Frontend-owned shipping address schema for the international checkout
 * form. It mirrors the backend `ShippingAddressDto` (fullName, line1,
 * optional line2, city, optional region, optional postalCode, ISO alpha-2
 * country, optional phone) without importing backend code; the wire shape
 * stays aligned through the generated `ShippingAddress` type.
 */
export const shippingSchema = z.object({
  fullName: z.string().trim().min(1, 'required').max(120),
  line1: z.string().trim().min(1, 'required').max(200),
  line2: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  city: z.string().trim().min(1, 'required').max(120),
  region: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  postalCode: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'country'),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;

export const EMPTY_SHIPPING: Record<keyof z.input<typeof shippingSchema>, string> = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  phone: '',
};
