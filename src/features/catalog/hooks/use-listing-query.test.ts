import { describe, expect, it } from 'vitest';
import { parseListingQuery, serializeListingQuery } from './use-listing-query';

describe('parseListingQuery', () => {
  it('returns defaults for an empty query', () => {
    expect(parseListingQuery(new URLSearchParams())).toEqual({
      q: '',
      category: '',
      brand: '',
      sort: '',
      inStockOnly: false,
      page: 1,
    });
  });

  it('parses every listing parameter', () => {
    const parsed = parseListingQuery(
      new URLSearchParams(
        'q=laptop&category=laptops&brand=corsair&sort=price_asc&inStock=1&page=3',
      ),
    );
    expect(parsed).toEqual({
      q: 'laptop',
      category: 'laptops',
      brand: 'corsair',
      sort: 'price_asc',
      inStockOnly: true,
      page: 3,
    });
  });

  it('rejects unknown sort values and clamps pages', () => {
    const parsed = parseListingQuery(new URLSearchParams('sort=bogus&page=0'));
    expect(parsed.sort).toBe('');
    expect(parsed.page).toBe(1);
  });
});

describe('serializeListingQuery', () => {
  it('omits defaults so the URL stays clean', () => {
    expect(
      serializeListingQuery({
        q: '',
        category: '',
        brand: '',
        sort: '',
        inStockOnly: false,
        page: 1,
      }),
    ).toBe('');
  });

  it('round-trips through parse', () => {
    const values = {
      q: 'ram',
      category: 'components',
      brand: '',
      sort: 'newest' as const,
      inStockOnly: true,
      page: 2,
    };
    expect(parseListingQuery(new URLSearchParams(serializeListingQuery(values)))).toEqual(values);
  });
});
