'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { CategoryForm } from '@/features/admin/components/category-form';
import { adminErrorMessage, adminHttp } from '@/features/admin/lib/admin-http';
import {
  buildUpdateCategoryRequest,
  validateCategoryForm,
  type CategoryFormErrors,
  type CategoryFormState,
  type CategoryValidationTexts,
} from '@/features/admin/lib/category-submit';
import { asOptionalId, type AdminCategory } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Edit container: prefilled from the server row, sends only changed
 * fields (translations replace the whole set). The edited category is
 * excluded from the parent options so it can never be its own parent
 * client-side; deeper cycles stay rejected server-side (400).
 */
export function CategoryEditContainer({
  category,
  categories,
  locales,
  defaultLocale,
  messages,
}: {
  category: AdminCategory;
  categories: AdminCategory[];
  locales: string[];
  defaultLocale: string;
  messages: Dictionary;
}) {
  const router = useRouter();
  const form = messages.admin.categoryForm;
  const initialTranslation =
    category.translations.length > 0 ? category.translations[0] : undefined;
  const initial = {
    name: category.name,
    slug: category.slug,
    parentId: asOptionalId(category.parentId),
    translationLocale: initialTranslation?.locale ?? '',
    translationName: initialTranslation?.name ?? '',
  };
  const [values, setValues] = useState<CategoryFormState>({
    name: initial.name,
    slug: initial.slug,
    parentId: initial.parentId ?? '',
    translationLocale: initial.translationLocale,
    translationName: initial.translationName,
  });
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const texts: CategoryValidationTexts = {
    required: messages.admin.required,
    slugInvalid: form.slugInvalid,
  };
  const parents = categories
    .filter((candidate) => candidate.id !== category.id)
    .map((candidate) => ({ value: candidate.id, label: candidate.name }));

  async function handleSubmit() {
    const nextErrors = validateCategoryForm(values, texts);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    setFeedback(null);
    try {
      await adminHttp.patch<AdminCategory>(
        `/categories/${encodeURIComponent(category.id)}`,
        buildUpdateCategoryRequest(values, initial),
      );
      setFeedback({ ok: true, text: form.updated });
      router.refresh();
    } catch (error) {
      setFeedback({ ok: false, text: adminErrorMessage(error, form.updateError) });
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
        formMessages={form}
      />
      {feedback ? (
        <Text
          role={feedback.ok ? 'status' : 'alert'}
          className={feedback.ok ? undefined : 'text-destructive'}
        >
          {feedback.text}
        </Text>
      ) : null}
      <Stack direction="horizontal" gap="md">
        <Button onClick={() => void handleSubmit()} loading={pending}>
          {pending ? messages.admin.saving : messages.admin.save}
        </Button>
      </Stack>
    </Stack>
  );
}
