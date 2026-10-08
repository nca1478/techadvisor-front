import { describe, expect, it } from 'vitest';
import {
  DOCUMENTS_MAX_UPLOAD_BYTES,
  isHttpUrl,
  isOptionalUuid,
  validateUploadFile,
} from '@/features/admin/lib/document-upload';

function makeFile(name: string, size: number): File {
  return { name, size } as File;
}

describe('validateUploadFile', () => {
  it('requires a non-empty file', () => {
    expect(validateUploadFile(null)).toBe('required');
    expect(validateUploadFile(makeFile('doc.pdf', 0))).toBe('required');
  });

  it('accepts the allowed extensions', () => {
    for (const name of [
      'manual.pdf',
      'page.html',
      'page.htm',
      'notes.md',
      'notes.markdown',
      'a.txt',
    ]) {
      expect(validateUploadFile(makeFile(name, 1024))).toBeNull();
    }
  });

  it('rejects oversized files', () => {
    expect(validateUploadFile(makeFile('big.pdf', DOCUMENTS_MAX_UPLOAD_BYTES + 1))).toBe(
      'too-large',
    );
  });

  it('rejects disallowed extensions as a first hint (backend decides)', () => {
    expect(validateUploadFile(makeFile('setup.exe', 1024))).toBe('type');
    expect(validateUploadFile(makeFile('noextension', 1024))).toBe('type');
  });
});

describe('isOptionalUuid', () => {
  it('accepts empty and valid UUIDs', () => {
    expect(isOptionalUuid('')).toBe(true);
    expect(isOptionalUuid('   ')).toBe(true);
    expect(isOptionalUuid('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe(true);
  });

  it('rejects non-UUID values', () => {
    expect(isOptionalUuid('not-a-uuid')).toBe(false);
  });
});

describe('isHttpUrl', () => {
  it('accepts http(s) URLs', () => {
    expect(isHttpUrl('https://example.com/manual.pdf')).toBe(true);
    expect(isHttpUrl('http://localhost:3000/x')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isHttpUrl('')).toBe(false);
    expect(isHttpUrl('ftp://example.com/x')).toBe(false);
    expect(isHttpUrl('not a url')).toBe(false);
  });
});
