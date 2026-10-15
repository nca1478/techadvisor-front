import { describe, expect, it } from 'vitest';
import {
  buildCreateCategoryRequest,
  buildUpdateCategoryRequest,
  isUuid,
  orderCategoriesForDisplay,
  validateCategoryForm,
  type CategoryFormState,
} from '@/features/admin/lib/category-submit';
import type { AdminCategory } from '@/lib/api/admin';

const TEXTS = { required: 'required', slugInvalid: 'bad slug', urlInvalid: 'bad url' };

const BASE: CategoryFormState = {
  name: 'Laptops',
  slug: 'laptops',
  parentId: '',
  translationLocale: '',
  translationName: '',
  imageUrl: '',
  imageAlt: '',
  showInHome: true,
};

describe('isUuid', () => {
  it('accepts UUIDs and rejects anything else', () => {
    expect(isUuid('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe(true);
    expect(isUuid('')).toBe(false);
    expect(isUuid('laptops')).toBe(false);
  });
});

describe('validateCategoryForm', () => {
  it('accepts a valid root category without translation', () => {
    expect(validateCategoryForm(BASE, TEXTS)).toEqual({});
  });

  it('rejects an empty name and a malformed slug', () => {
    const errors = validateCategoryForm({ ...BASE, name: '  ', slug: 'Bad Slug!' }, TEXTS);
    expect(errors['name']).toBe('required');
    expect(errors['slug']).toBe('bad slug');
  });

  it('rejects a non-UUID parent', () => {
    const errors = validateCategoryForm({ ...BASE, parentId: 'laptops' }, TEXTS);
    expect(errors['parentId']).toBe('required');
  });

  it('requires a translation name whenever a locale is picked', () => {
    const errors = validateCategoryForm(
      { ...BASE, translationLocale: 'es', translationName: '  ' },
      TEXTS,
    );
    expect(errors['translation']).toBe('required');
  });

  it('rejects non-https cover images but allows empty (no image)', () => {
    expect(validateCategoryForm(BASE, TEXTS)).toEqual({});
    expect(
      validateCategoryForm({ ...BASE, imageUrl: 'http://example.com/a.jpg' }, TEXTS)['imageUrl'],
    ).toBe('bad url');
    expect(
      validateCategoryForm({ ...BASE, imageUrl: 'https://images.unsplash.com/photo-123' }, TEXTS),
    ).toEqual({});
  });
});

describe('buildCreateCategoryRequest', () => {
  it('omits parentId at root level and collects the translation', () => {
    expect(
      buildCreateCategoryRequest({
        ...BASE,
        translationLocale: 'es',
        translationName: 'Portátiles',
      }),
    ).toEqual({
      name: 'Laptops',
      slug: 'laptops',
      showInHome: true,
      translations: [{ locale: 'es', name: 'Portátiles' }],
    });
  });

  it('sends the cover image and visibility flag', () => {
    expect(
      buildCreateCategoryRequest({
        ...BASE,
        imageUrl: 'https://images.unsplash.com/photo-123',
        imageAlt: 'Laptops',
        showInHome: false,
      }),
    ).toEqual({
      name: 'Laptops',
      slug: 'laptops',
      imageUrl: 'https://images.unsplash.com/photo-123',
      imageAlt: 'Laptops',
      showInHome: false,
      translations: [],
    });
  });

  it('sends the parent id for subcategories', () => {
    const parentId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    expect(buildCreateCategoryRequest({ ...BASE, parentId }).parentId).toBe(parentId);
  });
});

describe('buildUpdateCategoryRequest', () => {
  const initial = {
    name: 'Laptops',
    slug: 'laptops',
    parentId: null as string | null,
    translationLocale: '',
    translationName: '',
    imageUrl: null as string | null,
    imageAlt: null as string | null,
    showInHome: true,
  };

  it('sends only changed fields', () => {
    expect(buildUpdateCategoryRequest({ ...BASE, name: 'Notebooks' }, initial)).toEqual({
      name: 'Notebooks',
    });
  });

  it('clears the cover image with null and toggles home visibility', () => {
    expect(
      buildUpdateCategoryRequest(
        { ...BASE, imageUrl: '', imageAlt: '', showInHome: false },
        { ...initial, imageUrl: 'https://images.unsplash.com/photo-123', imageAlt: 'Laptops' },
      ),
    ).toEqual({ imageUrl: null, imageAlt: null, showInHome: false });
  });

  it('sends parentId null when moving back to root', () => {
    expect(
      buildUpdateCategoryRequest(BASE, {
        ...initial,
        parentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      }),
    ).toEqual({ parentId: null });
  });

  it('sends an empty body when nothing changed', () => {
    expect(buildUpdateCategoryRequest(BASE, initial)).toEqual({});
  });
});

describe('orderCategoriesForDisplay', () => {
  const row = (id: string, name: string, parentId: string | null): AdminCategory => ({
    id,
    name,
    slug: name.toLowerCase(),
    parentId: parentId as unknown as AdminCategory['parentId'],
    imageUrl: null,
    imageAlt: null,
    showInHome: true,
    translations: [],
  });

  it('nests children under their parents with depth', () => {
    const rows = orderCategoriesForDisplay([
      row('c2', 'Child', 'c1'),
      row('c1', 'Root', null),
      row('c3', 'Another', null),
    ]);
    expect(rows.map((entry) => [entry.category.id, entry.depth])).toEqual([
      ['c3', 0],
      ['c1', 0],
      ['c2', 1],
    ]);
  });

  it('falls back to root level for orphaned parents', () => {
    const rows = orderCategoriesForDisplay([row('c9', 'Orphan', 'missing')]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.depth).toBe(0);
  });
});
