import { describe, expect, it } from 'vitest';
import { getDictionarySync } from './dictionaries';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

describe('getDictionarySync', () => {
  it('returns the matching locale dictionary', () => {
    expect(getDictionarySync('es')).toEqual(es);
    expect(getDictionarySync('en')).toEqual(en);
  });

  it('falls back to the default locale for unknown values', () => {
    expect(getDictionarySync('fr')).toEqual(en);
    expect(getDictionarySync('')).toEqual(en);
  });

  it('keeps both locales on the same shape', () => {
    expect(Object.keys(es.catalog).sort()).toEqual(Object.keys(en.catalog).sort());
    expect(Object.keys(es.common).sort()).toEqual(Object.keys(en.common).sort());
    expect(Object.keys(es.nav).sort()).toEqual(Object.keys(en.nav).sort());
    expect(Object.keys(es.account).sort()).toEqual(Object.keys(en.account).sort());
    expect(Object.keys(es.admin).sort()).toEqual(Object.keys(en.admin).sort());
    expect(Object.keys(es.admin.dashboard).sort()).toEqual(Object.keys(en.admin.dashboard).sort());
    expect(Object.keys(es.admin.products).sort()).toEqual(Object.keys(en.admin.products).sort());
    expect(Object.keys(es.admin.productForm).sort()).toEqual(
      Object.keys(en.admin.productForm).sort(),
    );
    expect(Object.keys(es.admin.images).sort()).toEqual(Object.keys(en.admin.images).sort());
    expect(Object.keys(es.admin.inventory).sort()).toEqual(Object.keys(en.admin.inventory).sort());
    expect(Object.keys(es.admin.orders).sort()).toEqual(Object.keys(en.admin.orders).sort());
  });
});
