import { z } from 'zod';
import { type ApiClient, createApiClient } from './client';
import type { CompatibilityIssue } from './compatibility';

// mantener en sync con backend: POST /api/v1/advisor/compare
// (CompareRequestDto / CompareResponseDto en
// `backend/src/modules/advisor/dto/compare.dto.ts`).
// Tipos locales a propósito: el generador OpenAPI infiere mal esta forma
// (`values`/`best` como `string[]`, `specs` como `Record<string, never>`),
// así que se declaran según el contrato real y se validan con Zod. La
// tabla y el veredicto de compatibilidad los construye el backend con
// código determinista sobre SQL; el LLM solo redacta `summary` con citas
// `[n]` ya validadas.

export interface CompareProduct {
  productId: string;
  name: string;
  slug: string;
  priceAmount: number;
  currency: string;
  specs: Record<string, unknown>;
}

export interface CompareTableRow {
  /** Spec key, o `'price_amount'` para la fila de precio SQL. */
  key: string;
  /** Valores por columna de producto (`null` = el producto no tiene el spec). */
  values: unknown[];
  /** Índices de columna con el mejor valor (vacío cuando no es objetivo). */
  best: number[];
  direction: 'higher' | 'lower' | null;
}

export interface CompareCompatibility {
  compatible: boolean;
  issues: CompatibilityIssue[];
}

export interface CompareCitation {
  n: number;
  documentId: string;
  chunkId: string;
  title: string;
  snippet: string;
}

export interface CompareResponse {
  products: CompareProduct[];
  table: CompareTableRow[];
  compatibility: CompareCompatibility;
  summary: string;
  citations: CompareCitation[];
}

export interface CompareInput {
  productIds: string[];
  useCase?: string;
  locale?: string;
}

const citationSchema = z.object({
  n: z.number().int().min(1),
  documentId: z.string(),
  chunkId: z.string(),
  title: z.string(),
  snippet: z.string(),
});

const productSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  priceAmount: z.number().int().min(0),
  currency: z.string().min(1),
  specs: z.record(z.string(), z.unknown()),
});

const rowSchema = z.object({
  key: z.string().min(1),
  values: z.array(z.unknown()),
  best: z.array(z.number().int().min(0)),
  direction: z.enum(['higher', 'lower']).nullable(),
});

const issueSchema = z.object({
  rule: z.string().min(1),
  severity: z.enum(['error', 'warning']),
  productIds: z.array(z.string().min(1)),
  messageKey: z.string().min(1),
  message: z.string().min(1),
});

const compareResponseSchema = z.object({
  products: z.array(productSchema),
  table: z.array(rowSchema),
  compatibility: z.object({
    compatible: z.boolean(),
    issues: z.array(issueSchema),
  }),
  summary: z.string(),
  citations: z.array(citationSchema),
});

/** Parses a `/advisor/compare` payload. Throws on shape mismatch. */
export function parseCompareResponse(value: unknown): CompareResponse {
  const parsed = compareResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid compare response shape');
  }
  return parsed.data;
}

/** Máximo de productos comparables a la vez (contrato del backend: 2..3). */
export const COMPARE_MIN_PRODUCTS = 2;
export const COMPARE_MAX_PRODUCTS = 3;

/** Lee `?ids=a,b,c` tolerando duplicados y vacíos, preservando el orden. */
export function parseCompareIds(value: string | null | undefined): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  for (const part of value.split(',')) {
    const id = part.trim();
    if (id && !seen.has(id)) seen.add(id);
  }
  return [...seen];
}

/**
 * Compare reads. Habla con el BFF same-origin (`/api/advisor/compare`), que
 * reenvía al backend; nunca importa código del backend.
 */
export function createCompareApi(client: ApiClient = createApiClient()) {
  return {
    compare: async (input: CompareInput): Promise<CompareResponse> => {
      const raw = await client.post<unknown>('/advisor/compare', input);
      return parseCompareResponse(raw);
    },
  };
}

export type CompareApi = ReturnType<typeof createCompareApi>;
