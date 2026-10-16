import { describe, expect, it } from 'vitest';
import {
  resolveDocumentSubmit,
  validateDocumentWizardStep,
  type DocumentWizardState,
  type DocumentWizardTexts,
} from '@/features/admin/lib/document-wizard';

const TEXTS: DocumentWizardTexts = {
  fileRequired: 'file-required',
  fileTooLarge: 'file-too-large',
  fileTypeHint: 'file-type',
  required: 'required',
  urlInvalid: 'url-invalid',
};

const BASE: DocumentWizardState = {
  file: null,
  title: '',
  type: 'MANUAL',
  locale: 'en',
  productId: '',
  categoryId: '',
  sourceUrl: '',
};

function fileOf(name: string, size = 10): File {
  return new File([new Uint8Array(size)], name, { type: 'application/pdf' });
}

describe('document wizard validation', () => {
  it('lets step 1 advance without a file (URL alternative)', () => {
    expect(validateDocumentWizardStep(BASE, 0, TEXTS)).toEqual({});
  });

  it('flags an invalid attached file on step 1', () => {
    const errors = validateDocumentWizardStep({ ...BASE, file: fileOf('notes.exe') }, 0, TEXTS);
    expect(errors['file']).toBe('file-type');
  });

  it('flags non-UUID associations on step 1', () => {
    const errors = validateDocumentWizardStep({ ...BASE, productId: 'nope' }, 0, TEXTS);
    expect(errors['productId']).toBe('required');
    expect(errors['file']).toBeUndefined();
  });

  it('requires title and URL on step 2 when no file is attached', () => {
    const errors = validateDocumentWizardStep(BASE, 1, TEXTS);
    expect(errors['title']).toBe('required');
    expect(errors['sourceUrl']).toBe('url-invalid');
  });

  it('accepts step 2 with title and URL and resolves to the url submit', () => {
    const state: DocumentWizardState = {
      ...BASE,
      title: 'Warranty',
      sourceUrl: 'https://example.com/warranty',
    };
    expect(validateDocumentWizardStep(state, 1, TEXTS)).toEqual({});
    expect(resolveDocumentSubmit(state)).toBe('url');
  });

  it('prefers the file when both sources are present', () => {
    const state: DocumentWizardState = {
      ...BASE,
      file: fileOf('manual.pdf'),
      title: 'Manual',
      sourceUrl: 'https://example.com/manual',
    };
    expect(validateDocumentWizardStep(state, 1, TEXTS)).toEqual({});
    expect(resolveDocumentSubmit(state)).toBe('upload');
  });

  it('resolves to null when neither source is usable', () => {
    expect(resolveDocumentSubmit(BASE)).toBeNull();
  });
});
