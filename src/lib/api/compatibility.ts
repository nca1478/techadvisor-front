import { z } from 'zod';
import { type ApiClient, createApiClient } from './client';
import type { components } from './schema';

// mantener en sync con backend: POST /api/v1/compatibility/check
// (CompatibilityCheckRequestDto / CompatibilityCheckResponseDto).
// Tipos base generados desde el contrato OpenAPI; la validación runtime es
// local con Zod porque el BFF reenvía al backend sin importar su código.

export type CompatibilityIssue = components['schemas']['CompatibilityIssueDto'];
export type CompatibilityResult = components['schemas']['CompatibilityCheckResponseDto'];
export type CompatibilitySeverity = CompatibilityIssue['severity'];

export interface CompatibilityCheckItem {
  productId: string;
  qty: number;
}

export interface CompatibilityCheckInput {
  productIds?: string[];
  items?: CompatibilityCheckItem[];
  locale?: string;
}

const issueSchema = z.object({
  rule: z.string().min(1),
  severity: z.enum(['error', 'warning']),
  productIds: z.array(z.string().min(1)),
  messageKey: z.string().min(1),
  message: z.string().min(1),
});

const compatibilityResultSchema = z.object({
  compatible: z.boolean(),
  issues: z.array(issueSchema),
});

/** Parses a `/compatibility/check` payload. Throws on shape mismatch. */
export function parseCompatibilityResult(value: unknown): CompatibilityResult {
  const parsed = compatibilityResultSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid compatibility response shape');
  }
  return parsed.data;
}

/** Errors first, then warnings; stable for deterministic rendering. */
export function sortCompatibilityIssues(issues: CompatibilityIssue[]): CompatibilityIssue[] {
  return [...issues].sort((a, b) => {
    if (a.severity === b.severity) return a.rule.localeCompare(b.rule);
    return a.severity === 'error' ? -1 : 1;
  });
}

export function compatibilityHasErrors(issues: CompatibilityIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}

/**
 * Compatibility reads. Habla con el BFF same-origin
 * (`/api/compatibility/*`), que reenvía al backend; nunca importa código
 * del backend. El motor es determinista (reglas sobre `specs`); el LLM no
 * interviene en estos avisos.
 */
export function createCompatibilityApi(client: ApiClient = createApiClient()) {
  return {
    check: async (input: CompatibilityCheckInput): Promise<CompatibilityResult> => {
      const raw = await client.post<unknown>('/compatibility/check', input);
      return parseCompatibilityResult(raw);
    },
  };
}

export type CompatibilityApi = ReturnType<typeof createCompatibilityApi>;
