import { z } from 'zod';
import { type ApiClient, createApiClient } from './client';

// mantener en sync con backend: POST /api/v1/advisor/product-qa
// (ProductQaResponseDto) y POST /api/v1/advisor/feedback
// (AdvisorFeedbackResponseDto, stub append-only).
// Tipos locales a propósito: el contrato OpenAPI ya incluye advisor, pero
// el BFF valida la forma mínima que el widget necesita.

export interface AdvisorCitation {
  n: number;
  documentId: string;
  chunkId: string;
  title: string;
  snippet: string;
}

export interface ProductQaResponse {
  answer: string;
  citations: AdvisorCitation[];
  abstained: boolean;
}

export type FeedbackValue = 'up' | 'down';

export interface AdvisorFeedbackRequest {
  productId: string;
  question: string;
  answer: string;
  abstained: boolean;
  value: FeedbackValue;
}

const citationSchema = z.object({
  n: z.number().int().min(1),
  documentId: z.string(),
  chunkId: z.string(),
  title: z.string(),
  snippet: z.string(),
});

const productQaResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(citationSchema),
  abstained: z.boolean(),
});

const feedbackBodySchema = z.object({
  productId: z.string().min(1),
  question: z.string().min(1).max(1000),
  answer: z.string().min(1),
  abstained: z.boolean(),
  value: z.enum(['up', 'down']),
});

function parseProductQaResponse(value: unknown): ProductQaResponse {
  const parsed = productQaResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid advisor response shape');
  }
  return parsed.data;
}

/**
 * Advisor reads. Habla con el BFF same-origin (`/api/advisor/*`), que
 * reenvía al backend; nunca importa código del backend.
 */
export function createAdvisorApi(client: ApiClient = createApiClient()) {
  return {
    askProduct: async (input: {
      productId: string;
      question: string;
      locale?: string;
    }): Promise<ProductQaResponse> => {
      const raw = await client.post<unknown>('/advisor/product-qa', input);
      return parseProductQaResponse(raw);
    },
    sendFeedback: (input: AdvisorFeedbackRequest): Promise<{ ok: boolean }> => {
      const body = feedbackBodySchema.parse(input);
      return client.post<{ ok: boolean }>('/advisor/feedback', body);
    },
  };
}

export type AdvisorApi = ReturnType<typeof createAdvisorApi>;
