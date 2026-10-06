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
  });
});
