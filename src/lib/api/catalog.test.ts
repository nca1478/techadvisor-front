import { describe, expect, it } from 'vitest';
import type { CatalogCategory } from './catalog';
import { createApiClient } from './client';
import { createCatalogApi, visibleCategories } from './catalog';

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

describe('createCatalogApi', () => {
  it('requests the listing with query parameters', async () => {
    const { client, calls } = clientWithCapture();
    await createCatalogApi(client).listProducts({
      page: 2,
      limit: 12,
      sort: 'price_asc',
      q: 'ram',
    });
    expect(calls[0]).toContain('/catalog/products?');
    expect(calls[0]).toContain('page=2');
    expect(calls[0]).toContain('sort=price_asc');
  });

  it('requests product detail by slug', async () => {
    const { client, calls } = clientWithCapture();
    await createCatalogApi(client).productDetail('some-slug', 'es');
    expect(calls[0]).toContain('/catalog/products/some-slug?locale=es');
  });

  it('requests categories and brands', async () => {
    const { client, calls } = clientWithCapture();
    const api = createCatalogApi(client);
    await api.listCategories('en');
    await api.listBrands();
    expect(calls).toEqual([
      'http://test/api/v1/catalog/categories?locale=en',
      'http://test/api/v1/catalog/brands',
    ]);
  });

  it('keeps the uniform error shape on failures', async () => {
    const failing = createApiClient({
      baseUrl: 'http://test/api/v1',
      fetchFn: () =>
        Promise.resolve(
          new Response(JSON.stringify({ statusCode: 404, code: 'NOT_FOUND', message: 'Missing' }), {
            status: 404,
          }),
        ),
    });
    await expect(createCatalogApi(failing).productDetail('missing')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('visibleCategories', () => {
  const category = (overrides: Partial<CatalogCategory>): CatalogCategory =>
    ({
      id: 'id',
      name: 'Name',
      slug: 'slug',
      parentSlug: null,
      imageUrl: null,
      imageAlt: null,
      showInHome: true,
      specsSchema: [],
      ...overrides,
    }) as CatalogCategory;

  it('drops categories hidden by the admin flag', () => {
    const result = visibleCategories([
      category({ slug: 'shown' }),
      category({ slug: 'hidden', showInHome: false }),
    ]);
    expect(result.map((item) => item.slug)).toEqual(['shown']);
  });

  it('returns an empty list when nothing is enabled', () => {
    expect(visibleCategories([category({ showInHome: false })])).toEqual([]);
  });
});
