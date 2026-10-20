import { z } from 'zod';

/**
 * Frontend-owned auth form schemas. They mirror the backend DTOs
 * (`RegisterRequestDto` / `LoginRequestDto`: valid email, password min 10,
 * optional name) without importing backend code — the API contract stays in
 * sync through the generated OpenAPI types (`src/lib/api/auth.ts`).
 */
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(10, 'min10'),
  name: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Password-reset schemas (mirror the backend contract without importing it).
 * The OTP is a 6-digit string; the new password follows the register policy.
 */
export const passwordResetRequestSchema = z.object({
  email: z.email(),
});

export type PasswordResetRequestValues = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetVerifySchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/, 'invalidCode'),
});

export type PasswordResetVerifyValues = z.infer<typeof passwordResetVerifySchema>;

export const passwordResetNewSchema = z
  .object({
    password: z.string().min(10, 'min10'),
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'mismatch',
    path: ['confirmPassword'],
  });

export type PasswordResetNewValues = z.infer<typeof passwordResetNewSchema>;
