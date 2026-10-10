import { describe, expect, it, vi } from 'vitest';
import { createReviewsApi, formatAverageRating } from './reviews';
import type { ApiClient } from './client';

function stubClient(options: { get?: unknown; post?: unknown } = {}): ApiClient {
  return {
    baseUrl: 'http://test',
    get: vi.fn().mockResolvedValue(options.get ?? null),
    post: vi.fn().mockResolvedValue(options.post ?? null),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
}

describe('createReviewsApi', () => {
  it('parses the published list with its average', async () => {
    const client = stubClient({
      get: {
        data: [
          {
            id: 'r1',
            productId: 'p1',
            rating: 5,
            title: 'Great',
            body: 'Fast.',
            verifiedPurchase: true,
            createdAt: '2026-02-01T10:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        averageRating: 5,
      },
    });
    const api = createReviewsApi(client);

    const list = await api.listPublished('p1');

    expect(list.total).toBe(1);
    expect(list.averageRating).toBe(5);
    expect(list.data[0]?.title).toBe('Great');
    expect(client.get).toHaveBeenCalledWith('/reviews/product/p1');
  });

  it('forwards pagination params', async () => {
    const client = stubClient({
      get: { data: [], total: 0, page: 2, limit: 5, averageRating: null },
    });

    await createReviewsApi(client).listPublished('p1', { page: 2, limit: 5 });

    expect(client.get).toHaveBeenCalledWith('/reviews/product/p1?page=2&limit=5');
  });

  it('parses the wrapped summary and null while below the minimum', async () => {
    const withSummary = stubClient({
      get: {
        summary: {
          productId: 'p1',
          pros: ['Good battery'],
          cons: ['Heavy'],
          basedOnCount: 3,
          updatedAt: '2026-03-01T10:00:00.000Z',
        },
      },
    });
    const summary = await createReviewsApi(withSummary).getSummary('p1');
    expect(summary?.basedOnCount).toBe(3);

    const withoutSummary = stubClient({ get: { summary: null } });
    await expect(createReviewsApi(withoutSummary).getSummary('p1')).resolves.toBeNull();
  });

  it('rejects malformed payloads instead of rendering them', async () => {
    const client = stubClient({ get: { data: 'nope' } });

    await expect(createReviewsApi(client).listPublished('p1')).rejects.toThrow(
      'Invalid review list shape',
    );
  });

  it('validates the creation body before sending', async () => {
    const client = stubClient({
      post: {
        id: 'r1',
        productId: 'p1',
        rating: 5,
        title: 'Great',
        body: 'Fast.',
        verifiedPurchase: true,
        createdAt: '2026-02-01T10:00:00.000Z',
      },
    });

    // Zod rejects rating 6 before any network call.
    await expect(
      createReviewsApi(client).createReview({ productId: 'p1', rating: 6, title: 't', body: 'b' }),
    ).rejects.toThrow();
    expect(client.post).not.toHaveBeenCalled();
  });
});

describe('formatAverageRating', () => {
  it('rounds to one decimal and keeps null', () => {
    expect(formatAverageRating(4.5)).toBe('4.5');
    expect(formatAverageRating(4.666)).toBe('4.7');
    expect(formatAverageRating(null)).toBeNull();
  });
});
