import { z } from 'zod';

/**
 * Frontend-owned profile form schema. It mirrors the backend
 * `UpdateProfileRequestDto` (name, password) without importing backend code —
 * the API contract stays in sync through the generated OpenAPI types
 * (`src/lib/api/account.ts`). `confirmPassword` is a UI-only field: it is
 * checked locally and never sent to the API. Email is intentionally absent:
 * it cannot be updated. An empty password means "keep the current one".
 */
export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(1, 'required').max(100, 'tooLong'),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password.length === 0 || data.password.length >= 10, {
    message: 'min10',
    path: ['password'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'mismatch',
    path: ['confirmPassword'],
  });

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
