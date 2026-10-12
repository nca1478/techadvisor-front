'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { CategoryFormErrors, CategoryFormState } from '@/features/admin/lib/category-submit';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Presentational category form. All state lives in the container; the
 * parent select lists every other category (the container excludes the
 * edited one so a category can never be its own parent client-side —
 * the backend re-validates cycles server-side).
 */
export function CategoryForm({
  values,
  errors,
  parents,
  locales,
  defaultLocale,
  onChange,
  formMessages,
}: {
  values: CategoryFormState;
  errors: CategoryFormErrors;
  parents: Array<{ value: string; label: string }>;
  locales: string[];
  defaultLocale: string;
  onChange: (patch: Partial<CategoryFormState>) => void;
  formMessages: Dictionary['admin']['categoryForm'];
}) {
  const otherLocales = locales.filter((locale) => locale !== defaultLocale);

  return (
    <Stack gap="md">
      <Stack direction="horizontal" gap="md" wrap>
        <div className="min-w-52 flex-1">
          <Input
            label={formMessages.name}
            name="name"
            value={values.name}
            error={errors['name']}
            onChange={(event) => {
              onChange({ name: event.target.value });
            }}
          />
        </div>
        <div className="min-w-52 flex-1">
          <Input
            label={formMessages.slug}
            name="slug"
            value={values.slug}
            hint={formMessages.slugHint}
            error={errors['slug']}
            onChange={(event) => {
              onChange({ slug: event.target.value });
            }}
          />
        </div>
      </Stack>
      <div className="min-w-52 max-w-md">
        <Select
          label={formMessages.parent}
          name="parentId"
          value={values.parentId}
          options={parents}
          placeholder={formMessages.noParent}
          hint={formMessages.parentHint}
          error={errors['parentId']}
          onChange={(event) => {
            onChange({ parentId: event.target.value });
          }}
        />
      </div>
      {otherLocales.length > 0 ? (
        <Stack gap="sm">
          <Text variant="lead" as="div">
            {formMessages.translationTitle}
          </Text>
          <Text variant="small" tone="muted">
            {formMessages.translationSubtitle}
          </Text>
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-52 flex-1">
              <Select
                label={formMessages.translationLocale}
                name="translationLocale"
                value={values.translationLocale}
                options={otherLocales.map((locale) => ({ value: locale, label: locale }))}
                placeholder="—"
                onChange={(event) => {
                  onChange({ translationLocale: event.target.value });
                }}
              />
            </div>
            <div className="min-w-52 flex-1">
              <Input
                label={formMessages.translationName}
                name="translationName"
                value={values.translationName}
                error={errors['translation']}
                onChange={(event) => {
                  onChange({ translationName: event.target.value });
                }}
              />
            </div>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}
