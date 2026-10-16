'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { DocumentUploadWizard } from '@/features/admin/components/document-upload-wizard';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import {
  resolveDocumentSubmit,
  validateDocumentWizardStep,
  type DocumentWizardState,
  type DocumentWizardTexts,
} from '@/features/admin/lib/document-wizard';
import type { AdminDocument } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Upload wizard container: holds the shared file/URL state, validates per
 * step with the shared wizard rules and submits once from step 2 — file
 * upload when a file was attached, URL registration otherwise. On success
 * it returns to the documents list so ingestion can be followed there.
 */
export function DocumentUploadContainer({
  locale,
  messages,
  initialTitle = '',
}: {
  locale: string;
  messages: Dictionary;
  /** Prefills the title (e.g. from the advisor panel "create document" shortcut). */
  initialTitle?: string;
}) {
  const router = useRouter();
  const docs = messages.admin.documents;
  const [values, setValues] = useState<DocumentWizardState>({
    file: null,
    title: initialTitle,
    type: 'MANUAL',
    locale: 'en',
    productId: '',
    categoryId: '',
    sourceUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileResetKey, setFileResetKey] = useState(0);

  const texts: DocumentWizardTexts = useMemo(
    () => ({
      fileRequired: docs.fileRequired,
      fileTooLarge: docs.fileTooLarge,
      fileTypeHint: docs.fileTypeHint,
      required: messages.admin.required,
      urlInvalid: docs.urlInvalid,
    }),
    [docs, messages.admin.required],
  );

  function handleValidateStep(step: number): Record<string, string> {
    const scoped = validateDocumentWizardStep(values, step, texts);
    setErrors(scoped);
    return scoped;
  }

  async function handleSubmit() {
    const scoped = validateDocumentWizardStep(values, 1, texts);
    setErrors(scoped);
    if (Object.keys(scoped).length > 0) return;
    const mode = resolveDocumentSubmit(values);
    if (mode === null) return;
    setPending(true);
    setServerError(null);
    try {
      if (mode === 'upload') {
        const form = new FormData();
        form.set('file', values.file as File);
        if (values.title.trim() !== '') {
          form.set('title', values.title.trim());
        }
        form.set('type', values.type);
        form.set('locale', values.locale);
        if (values.productId.trim() !== '') {
          form.set('productId', values.productId.trim());
        }
        if (values.categoryId.trim() !== '') {
          form.set('categoryId', values.categoryId.trim());
        }
        await adminHttp.postForm<AdminDocument>('/documents/upload', form);
      } else {
        await adminHttp.post<AdminDocument>('/documents', {
          title: values.title.trim(),
          type: values.type,
          locale: values.locale,
          sourceUrl: values.sourceUrl.trim(),
        });
      }
      router.push(`/${locale}/admin/documentos`);
      router.refresh();
    } catch (error) {
      setServerError(
        adminErrorMessage(error, mode === 'upload' ? docs.uploadError : docs.registerError),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Stack gap="md">
      <DocumentUploadWizard
        values={values}
        errors={errors}
        fileResetKey={fileResetKey}
        pending={pending}
        docs={docs}
        onFileChange={(file) => {
          setValues((prev) => ({ ...prev, file }));
          if (file === null) {
            setFileResetKey((key) => key + 1);
          }
        }}
        onChange={(patch) => {
          setValues((prev) => ({ ...prev, ...patch }));
        }}
        onValidateStep={handleValidateStep}
        onSubmit={() => void handleSubmit()}
      />
      {serverError ? (
        <Text role="alert" className="text-destructive">
          {serverError}
        </Text>
      ) : null}
    </Stack>
  );
}
