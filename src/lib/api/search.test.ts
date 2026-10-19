import { describe, expect, it } from 'vitest';
import { createApiClient } from './client';
import { createSearchApi } from './search';

function inputToUrl(input: string | URL | Request): string {
  if (typeof input === 'string') return input;
  if (input instanceof Request) return input.url;
  return input.href;
}

function clientWithCapture() {
  const calls: string[] = [];
  const client = createApiClient({
    baseUrl: 'http://test/api/v1',
    fetchFn: (input: string | URL | Request) => {
      calls.push(inputToUrl(input));
      return Promise.resolve(
        new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }),
      );
    },
  });
  return { client, calls };
}

describe('createSearchApi', () => {
  it('requests natural-language search with filters', async () => {
    const { client, calls } = clientWithCapture();
    await createSearchApi(client).search({
      q: 'audífonos livianos',
      category: 'audio',
      brand: 'testbrand',
      sort: 'price_asc',
      inStock: '1',
      maxPrice: 15000,
      currency: 'USD',
      locale: 'es',
      limit: 5,
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain('/search?');
    expect(decodeURIComponent((calls[0] ?? '').replaceAll('+', ' '))).toContain(
      'q=audífonos livianos',
    );
    for (const fragment of [
      'category=audio',
      'brand=testbrand',
      'sort=price_asc',
      'inStock=1',
      'maxPrice=15000',
      'currency=USD',
      'locale=es',
      'limit=5',
    ]) {
      expect(calls[0]).toContain(fragment);
    }
  });

  it('omits empty optional parameters', async () => {
    const { client, calls } = clientWithCapture();
    await createSearchApi(client).search({ q: 'laptop' });
    expect(calls[0]).toBe('http://test/api/v1/search?q=laptop');
  });
});
