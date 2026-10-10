import { z } from 'zod';
import { type ApiClient, createApiClient } from './client';

// mantener en sync con backend: POST /api/v1/reviews (CreateReviewRequestDto),
// GET /api/v1/reviews/product/:productId (ReviewListDto),
// GET /api/v1/reviews/product/:productId/summary ({ summary: ReviewSummaryDto | null }).
// Tipos locales a propósito: el BFF valida la forma mínima que la UI de
// reseñas necesita (ver src/lib/api/schema.d.ts para el contrato OpenAPI completo).

export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewList {
  data: ProductReview[];
  total: number;
  page: number;
  limit: number;
  averageRating: number | null;
}

export interface ReviewSummary {
  productId: string;
  pros: string[];
  cons: string[];
  basedOnCount: number;
  model?: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  body: string;
}

const productReviewSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string(),
  body: z.string(),
  verifiedPurchase: z.boolean(),
  createdAt: z.string(),
});

const reviewListSchema = z.object({
  data: z.array(productReviewSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  averageRating: z.number().nullable(),
});

const reviewSummarySchema = z.object({
  productId: z.string().min(1),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  basedOnCount: z.number().int().min(0),
  model: z.string().optional(),
  updatedAt: z.string(),
});

const reviewSummaryResponseSchema = z.object({
  summary: reviewSummarySchema.nullable(),
});

export const createReviewBodySchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2000),
});

function parseReviewList(value: unknown): ReviewList {
  const parsed = reviewListSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid review list shape');
  }
  return parsed.data;
}

function parseReviewSummaryResponse(value: unknown): ReviewSummary | null {
  const parsed = reviewSummaryResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid review summary shape');
  }
  return parsed.data.summary;
}

function parseProductReview(value: unknown): ProductReview {
  const parsed = productReviewSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid review shape');
  }
  return parsed.data;
}

/** Average rating formatted for display (one decimal) or null when none. */
export function formatAverageRating(average: number | null): string | null {
  if (average === null) return null;
  return (Math.round(average * 10) / 10).toFixed(1);
}

/**
 * Reviews reads/writes. Public reads work against the backend directly;
 * creation goes through the same-origin BFF (`/api/reviews`, which attaches
 * the httpOnly auth cookies) — pass a same-origin client for it. See
 * `src/app/api/reviews/[...path]/route.ts`.
 */
export function createReviewsApi(client: ApiClient = createApiClient()) {
  return {
    listPublished: async (productId: string, params: { page?: number; limit?: number } = {}) => {
      const search = new URLSearchParams();
      if (params.page !== undefined) search.set('page', String(params.page));
      if (params.limit !== undefined) search.set('limit', String(params.limit));
      const query = search.toString();
      const raw = await client.get<unknown>(
        `/reviews/product/${encodeURIComponent(productId)}${query ? `?${query}` : ''}`,
      );
      return parseReviewList(raw);
    },
    getSummary: async (productId: string): Promise<ReviewSummary | null> => {
      const raw = await client.get<unknown>(
        `/reviews/product/${encodeURIComponent(productId)}/summary`,
      );
      return parseReviewSummaryResponse(raw);
    },
    createReview: async (input: CreateReviewInput): Promise<ProductReview> => {
      const body = createReviewBodySchema.parse(input);
      const raw = await client.post<unknown>('/reviews', body);
      return parseProductReview(raw);
    },
  };
}

export type ReviewsApi = ReturnType<typeof createReviewsApi>;
