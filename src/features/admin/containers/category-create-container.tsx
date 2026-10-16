'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { CategoryForm } from '@/features/admin/components/category-form';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import {
  buildCreateCategoryRequest,
  categoryErrorsForStep,
  validateCategoryForm,
  type CategoryFormErrors,
  type CategoryFormState,
  type CategoryValidationTexts,
} from '@/features/admin/lib/category-submit';
import type { AdminCategory } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Create container: holds form state, validates with the shared category
 * rules, posts to the BFF and navigates to the edit page on success so
 * the admin can adjust the translation right away.
 */
export function CategoryCreateContainer({
  locale,
  categories,
  locales,
  defaultLocale,
  messages,
}: {
  locale: string;
  categories: AdminCategory[];
  locales: string[];
  defaultLocale: string;
  messages: Dictionary;
}) {
  const router = useRouter();
  const form = messages.admin.categoryForm;
  const [values, setValues] = useState<CategoryFormState>({
    name: '',
    slug: '',
    parentId: '',
    translationLocale: '',
    translationName: '',
    imageUrl: '',
    imageAlt: '',
    showInHome: true,
  });
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const texts: CategoryValidationTexts = {
    required: messages.admin.required,
    slugInvalid: form.slugInvalid,
    urlInvalid: form.urlInvalid,
  };
  const parents = categories.map((category) => ({ value: category.id, label: category.name }));

  function handleValidateStep(step: number): CategoryFormErrors {
    const nextErrors = validateCategoryForm(values, texts);
    setErrors(nextErrors);
    return categoryErrorsForStep(nextErrors, step);
  }

  async function handleSubmit() {
    const nextErrors = validateCategoryForm(values, texts);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    setServerError(null);
    try {
      const created = await adminHttp.post<AdminCategory>(
        '/categories',
        buildCreateCategoryRequest(values),
      );
      router.push(`/${locale}/admin/categorias/${encodeURIComponent(created.id)}`);
      router.refresh();
    } catch (error) {
      setServerError(adminErrorMessage(error, form.createError));
    } finally {
      setPending(false);
    }
  }

  return (
    <Stack gap="md">
      <CategoryForm
        values={values}
        errors={errors}
        parents={parents}
        locales={locales}
        defaultLocale={defaultLocale}
        onChange={(patch) => {
          setValues((prev) => ({ ...prev, ...patch }));
        }}
        onValidateStep={handleValidateStep}
        onSubmit={() => void handleSubmit()}
        pending={pending}
        submitLabel={form.create}
        submitPendingLabel={form.creating}
        footerNote={
          serverError ? (
            <Text role="alert" className="text-destructive">
              {serverError}
            </Text>
          ) : null
        }
        formMessages={form}
      />
    </Stack>
  );
}
