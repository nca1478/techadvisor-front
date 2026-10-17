import { describe, expect, it } from 'vitest';
import {
  buildSpecsRecord,
  formatMinorToMajor,
  inventoryAdjustFormSchema,
  isHttpsUrl,
  parseDelta,
  parseMajorToMinor,
  parseWholeUnits,
  productImagesFormSchema,
  slugField,
} from '@/features/admin/lib/admin-schemas';
import {
  buildCreateRequest,
  buildUpdateRequest,
  collectTranslations,
  errorsForStep,
  firstErrorStep,
  initialStockError,
  pickInitialTranslation,
  validateProductForm,
  type ProductFormState,
} from '@/features/admin/lib/product-submit';
import type { SpecField } from '@/lib/api/admin';

const TEXTS = {
  required: 'required',
  slugInvalid: 'bad slug',
  priceInvalid: 'bad price',
  initialStockInvalid: 'bad stock',
  specsInvalidInteger: 'bad integer',
  specsInvalidNumber: 'bad number',
};

const FIELDS: SpecField[] = [
  { key: 'cpu', label: 'Processor', type: 'string' },
  { key: 'ram_gb', label: 'RAM', type: 'integer', unit: 'GB' },
  { key: 'screen_inches', label: 'Screen', type: 'number', unit: 'inches' },
  { key: 'touch', label: 'Touch', type: 'boolean' },
  { key: 'ram_type', label: 'Memory', type: 'enum', options: ['DDR4', 'DDR5'] },
];

const BASE_VALUES: ProductFormState = {
  sku: 'SKU-1',
  name: 'Laptop',
  slug: 'laptop-1',
  description: 'A laptop',
  brandId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  categoryId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  priceMajor: '1299.99',
  currency: 'USD',
  status: 'DRAFT',
  initialStock: '5',
  specsRaw: {},
  translationLocale: '',
  translationName: '',
  translationDescription: '',
};

describe('isHttpsUrl', () => {
  it('accepts https URLs only', () => {
    expect(isHttpsUrl('https://cdn.example.com/a.jpg')).toBe(true);
    expect(isHttpsUrl('http://cdn.example.com/a.jpg')).toBe(false);
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpsUrl('data:image/png;base64,xx')).toBe(false);
    expect(isHttpsUrl('not a url')).toBe(false);
  });
});

describe('slugField', () => {
  it('accepts dashed lowercase slugs', () => {
    expect(slugField.safeParse('ultrabook-pro-14').success).toBe(true);
    expect(slugField.safeParse('Ultrabook Pro').success).toBe(false);
    expect(slugField.safeParse('').success).toBe(false);
  });
});

describe('parseMajorToMinor', () => {
  it('converts decimals to minor units', () => {
    expect(parseMajorToMinor('1299.99', 'USD')).toBe(129999);
    expect(parseMajorToMinor('1299', 'USD')).toBe(129900);
    expect(parseMajorToMinor('0.5', 'USD')).toBe(50);
  });

  it('rejects invalid shapes', () => {
    expect(parseMajorToMinor('-1', 'USD')).toBeNull();
    expect(parseMajorToMinor('1.999', 'USD')).toBeNull();
    expect(parseMajorToMinor('abc', 'USD')).toBeNull();
    expect(parseMajorToMinor('', 'USD')).toBeNull();
  });

  it('supports zero-decimal currencies', () => {
    expect(parseMajorToMinor('1500', 'JPY')).toBe(1500);
    expect(parseMajorToMinor('15.5', 'JPY')).toBeNull();
  });

  it('round-trips through formatMinorToMajor', () => {
    expect(formatMinorToMajor(129999, 'USD')).toBe('1299.99');
    expect(formatMinorToMajor(1500, 'JPY')).toBe('1500');
  });
});

describe('parseWholeUnits / parseDelta', () => {
  it('parses non-negative integers', () => {
    expect(parseWholeUnits('12', 1_000_000)).toBe(12);
    expect(parseWholeUnits('12.5', 1_000_000)).toBeNull();
    expect(parseWholeUnits('-1', 1_000_000)).toBeNull();
  });

  it('rejects zero and non-integers for deltas', () => {
    expect(parseDelta('3')).toBe(3);
    expect(parseDelta('-4')).toBe(-4);
    expect(parseDelta('0')).toBeNull();
    expect(parseDelta('1.5')).toBeNull();
    expect(parseDelta('abc')).toBeNull();
  });

  it('validates the adjust form shape', () => {
    expect(inventoryAdjustFormSchema.safeParse({ delta: '3', reason: 'Restock' }).success).toBe(
      true,
    );
    expect(inventoryAdjustFormSchema.safeParse({ delta: '', reason: '' }).success).toBe(false);
  });
});

describe('productImagesFormSchema', () => {
  it('accepts up to 10 https images', () => {
    const images = [{ url: 'https://cdn.example.com/a.jpg', alt: 'Front' }];
    expect(productImagesFormSchema.safeParse({ images }).success).toBe(true);
    expect(
      productImagesFormSchema.safeParse({ images: [{ url: 'http://x.test/a.jpg', alt: '' }] })
        .success,
    ).toBe(false);
    expect(
      productImagesFormSchema.safeParse({
        images: Array.from({ length: 11 }, (_, index) => ({
          url: `https://cdn.example.com/${String(index)}.jpg`,
          alt: '',
        })),
      }).success,
    ).toBe(false);
  });
});

describe('buildSpecsRecord', () => {
  it('coerces every field type and omits empties', () => {
    const { record, errors } = buildSpecsRecord(
      FIELDS,
      {
        cpu: 'Intel',
        ram_gb: '16',
        screen_inches: '13.3',
        touch: 'true',
        ram_type: 'DDR5',
        extra: '',
      },
      TEXTS.specsInvalidInteger,
      TEXTS.specsInvalidNumber,
    );
    expect(errors).toEqual({});
    expect(record).toEqual({
      cpu: 'Intel',
      ram_gb: 16,
      screen_inches: 13.3,
      touch: true,
      ram_type: 'DDR5',
    });
  });

  it('reports per-field errors and drops unknown keys', () => {
    const { record, errors } = buildSpecsRecord(
      FIELDS,
      { ram_gb: 'lots', screen_inches: 'huge', touch: 'maybe', ram_type: 'DDR3', injected: 'x' },
      TEXTS.specsInvalidInteger,
      TEXTS.specsInvalidNumber,
    );
    expect(record).toEqual({});
    expect(errors['ram_gb']).toBe(TEXTS.specsInvalidInteger);
    expect(errors['screen_inches']).toBe(TEXTS.specsInvalidNumber);
    expect(errors['touch']).toBe(TEXTS.specsInvalidNumber);
    expect(errors['ram_type']).toBe(TEXTS.specsInvalidNumber);
    expect('injected' in errors).toBe(false);
  });
});

describe('validateProductForm', () => {
  it('accepts a complete form and coerces specs + price', () => {
    const validated = validateProductForm(
      {
        ...BASE_VALUES,
        specsRaw: { cpu: 'Intel', ram_gb: '16' },
      },
      FIELDS,
      TEXTS,
    );
    expect(validated.errors).toEqual({});
    expect(validated.priceAmount).toBe(129999);
    expect(validated.specs).toEqual({ cpu: 'Intel', ram_gb: 16 });
  });

  it('flags missing fields, bad slug and bad price', () => {
    const validated = validateProductForm(
      { ...BASE_VALUES, name: '', slug: 'Bad Slug', priceMajor: 'nope', brandId: '' },
      FIELDS,
      TEXTS,
    );
    expect(validated.errors['name']).toBe(TEXTS.required);
    expect(validated.errors['slug']).toBe(TEXTS.slugInvalid);
    expect(validated.errors['priceMajor']).toBe(TEXTS.priceInvalid);
    expect(validated.errors['brandId']).toBe(TEXTS.required);
    expect(validated.priceAmount).toBeNull();
  });
});

describe('errorsForStep', () => {
  it('scopes errors to identity, catalog, specs and leaves translation open', () => {
    const all = {
      sku: 'required',
      priceMajor: 'bad price',
      'specs.ram_gb': 'bad integer',
    };
    expect(errorsForStep(all, 0, 'create')).toEqual({ sku: 'required' });
    expect(errorsForStep(all, 1, 'create')).toEqual({ priceMajor: 'bad price' });
    expect(errorsForStep(all, 2, 'create')).toEqual({ 'specs.ram_gb': 'bad integer' });
    expect(errorsForStep(all, 3, 'create')).toEqual({});
  });

  it('excludes create-only stock errors in edit mode', () => {
    const all = { initialStock: 'bad stock' };
    expect(errorsForStep(all, 1, 'create')).toEqual({ initialStock: 'bad stock' });
    expect(errorsForStep(all, 1, 'edit')).toEqual({});
  });
});

describe('firstErrorStep', () => {
  it('returns null when there are no errors', () => {
    expect(firstErrorStep({}, 'edit')).toBeNull();
  });

  it('points at the earliest failing base step', () => {
    expect(firstErrorStep({ name: 'required', priceMajor: 'bad price' }, 'edit')).toBe(0);
    expect(firstErrorStep({ priceMajor: 'bad price' }, 'edit')).toBe(1);
    expect(firstErrorStep({ 'specs.ram_gb': 'bad integer' }, 'edit')).toBe(2);
  });

  it('ignores create-only stock errors in edit mode', () => {
    expect(firstErrorStep({ initialStock: 'bad stock' }, 'edit')).toBe(0);
    expect(firstErrorStep({ initialStock: 'bad stock' }, 'create')).toBe(1);
  });
});

describe('pickInitialTranslation', () => {
  it('prefers the first non-default locale', () => {
    expect(
      pickInitialTranslation(
        [
          { locale: 'en', name: 'Laptop', description: 'A laptop' },
          { locale: 'es', name: 'Portátil', description: 'Un portátil' },
        ],
        'en',
      ),
    ).toEqual({ locale: 'es', name: 'Portátil', description: 'Un portátil' });
  });

  it('falls back to the first row and to undefined when empty', () => {
    expect(
      pickInitialTranslation([{ locale: 'en', name: 'Laptop', description: 'A' }], 'en'),
    ).toEqual({
      locale: 'en',
      name: 'Laptop',
      description: 'A',
    });
    expect(pickInitialTranslation([], 'en')).toBeUndefined();
  });
});

describe('buildCreateRequest / buildUpdateRequest', () => {
  it('builds the create payload with translations and stock', () => {
    const body = buildCreateRequest(
      {
        ...BASE_VALUES,
        translationLocale: 'es',
        translationName: 'Portátil',
        translationDescription: 'Un portátil',
      },
      { ram_gb: 16 },
      129999,
      5,
    );
    expect(body.priceAmount).toBe(129999);
    expect(body.initialStock).toBe(5);
    expect(body.translations).toEqual([
      { locale: 'es', name: 'Portátil', description: 'Un portátil' },
    ]);
  });

  it('omits empty translations', () => {
    expect(collectTranslations(BASE_VALUES)).toEqual([]);
    const body = buildUpdateRequest(BASE_VALUES, {}, 100);
    expect(body.translations).toEqual([]);
    expect(body).not.toHaveProperty('status');
  });

  it('flags invalid initial stock', () => {
    expect(initialStockError('5', TEXTS)).toBeNull();
    expect(initialStockError('-1', TEXTS)).toBe(TEXTS.initialStockInvalid);
    expect(initialStockError('x', TEXTS)).toBe(TEXTS.initialStockInvalid);
  });
});
