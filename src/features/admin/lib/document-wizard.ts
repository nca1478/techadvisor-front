import {
  isHttpUrl,
  isOptionalUuid,
  validateUploadFile,
  type UploadFileError,
} from '@/features/admin/lib/document-upload';

/** Shared wizard state: step 1 fills the file side, step 2 the URL side. */
export interface DocumentWizardState {
  file: File | null;
  title: string;
  type: string;
  locale: string;
  productId: string;
  categoryId: string;
  sourceUrl: string;
}

export interface DocumentWizardTexts {
  fileRequired: string;
  fileTooLarge: string;
  fileTypeHint: string;
  required: string;
  urlInvalid: string;
}

const FILE_ERROR_TEXTS: Record<UploadFileError, keyof DocumentWizardTexts> = {
  required: 'fileRequired',
  'too-large': 'fileTooLarge',
  type: 'fileTypeHint',
};

/**
 * XOR rule (ADR 0051): a file and a URL are alternatives. Step 1 never
 * requires the file (the admin may go register a URL instead); the final
 * step requires one of the two sources. When both are present the file
 * wins and the URL is ignored.
 */
export function resolveDocumentSubmit(state: DocumentWizardState): 'upload' | 'url' | null {
  if (state.file !== null) {
    return 'upload';
  }
  if (state.title.trim() !== '' && isHttpUrl(state.sourceUrl)) {
    return 'url';
  }
  return null;
}

function fileError(
  state: DocumentWizardState,
  texts: DocumentWizardTexts,
  errors: Record<string, string>,
): void {
  if (state.file === null) {
    return;
  }
  const failure = validateUploadFile(state.file);
  if (failure !== null) {
    errors['file'] = texts[FILE_ERROR_TEXTS[failure]];
  }
}

function associationErrors(
  state: DocumentWizardState,
  texts: DocumentWizardTexts,
  errors: Record<string, string>,
): void {
  if (!isOptionalUuid(state.productId)) {
    errors['productId'] = texts.required;
  }
  if (!isOptionalUuid(state.categoryId)) {
    errors['categoryId'] = texts.required;
  }
}

/**
 * Step 0 (upload file screen): validates an attached file when present plus
 * the optional UUID associations. Step 1 (register URL screen): same as
 * step 0 when a file is attached; otherwise requires a title and a valid
 * http(s) URL.
 */
export function validateDocumentWizardStep(
  state: DocumentWizardState,
  step: number,
  texts: DocumentWizardTexts,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step <= 0) {
    fileError(state, texts, errors);
    associationErrors(state, texts, errors);
    return errors;
  }
  if (state.file !== null) {
    fileError(state, texts, errors);
    associationErrors(state, texts, errors);
    return errors;
  }
  if (state.title.trim() === '') {
    errors['title'] = texts.required;
  }
  if (!isHttpUrl(state.sourceUrl)) {
    errors['sourceUrl'] = texts.urlInvalid;
  }
  return errors;
}
