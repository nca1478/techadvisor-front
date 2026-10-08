/**
 * Client-side pre-validation for admin document uploads. The backend
 * re-validates strictly (real MIME via magic bytes, size cap) — this only
 * gives instant feedback. Keep the limits in sync with the backend
 * (`DOCUMENTS_MAX_BYTES`, ADR 0020).
 */

export const DOCUMENTS_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = ['pdf', 'html', 'htm', 'md', 'markdown', 'txt'] as const;

export type UploadFileError = 'required' | 'too-large' | 'type';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns the failure reason, or `null` when the file looks acceptable. */
export function validateUploadFile(file: File | null): UploadFileError | null {
  if (file === null) {
    return 'required';
  }
  if (file.size === 0) {
    return 'required';
  }
  if (file.size > DOCUMENTS_MAX_UPLOAD_BYTES) {
    return 'too-large';
  }
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf('.');
  const extension = dot >= 0 ? name.slice(dot + 1) : '';
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
    return 'type';
  }
  return null;
}

/** Optional UUID association fields: empty is fine, non-empty must be a UUID. */
export function isOptionalUuid(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === '' || UUID_PATTERN.test(trimmed);
}

/** Accepts only http(s) URLs (the backend enforces the same). */
export function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) {
    return false;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
