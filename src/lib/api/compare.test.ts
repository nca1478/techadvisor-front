import { describe, expect, it } from 'vitest';
import { parseCompareIds, parseCompareResponse } from './compare';

function response() {
  return {
    products: [
      {
        productId: 'a-id',
        name: 'Board A',
        slug: 'board-a',
        priceAmount: 10000,
        currency: 'USD',
        specs: { ram_gb: 16 },
      },
      {
        productId: 'b-id',
        name: 'Board B',
        slug: 'board-b',
        priceAmount: 8000,
        currency: 'USD',
        specs: { ram_gb: 32 },
      },
    ],
    table: [
      { key: 'price_amount', values: [10000, 8000], best: [1], direction: 'lower' },
      { key: 'ram_gb', values: [16, 32], best: [1], direction: 'higher' },
    ],
    compatibility: { compatible: true, issues: [] },
    summary: 'B offers more RAM [1] for less money.',
    citations: [{ n: 1, documentId: 'd', chunkId: 'c', title: 'Board B manual', snippet: '…' }],
  };
}

describe('parseCompareResponse', () => {
  it('accepts the backend contract shape (SQL table + cited summary)', () => {
    const parsed = parseCompareResponse(response());
    expect(parsed.products).toHaveLength(2);
    expect(parsed.table[0]?.key).toBe('price_amount');
    expect(parsed.summary).toContain('[1]');
  });

  it('rejects unknown shapes', () => {
    expect(() => parseCompareResponse(null)).toThrow();
    expect(() => parseCompareResponse({ ...response(), products: [] })).not.toThrow();
    expect(() => parseCompareResponse({ ...response(), summary: 42 })).toThrow();
  });
});

describe('parseCompareIds', () => {
  it('parses ?ids= tolerating duplicates, blanks and spacing', () => {
    expect(parseCompareIds(null)).toEqual([]);
    expect(parseCompareIds('')).toEqual([]);
    expect(parseCompareIds('a, b,,a,c')).toEqual(['a', 'b', 'c']);
  });
});
