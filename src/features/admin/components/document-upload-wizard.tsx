'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { cn } from '@/components/ui/cn';
import {
  AssociationSelect,
  type AssociationOption,
} from '@/features/admin/components/association-select';
import type { DocumentWizardState } from '@/features/admin/lib/document-wizard';
import { ADMIN_DOCUMENT_TYPES } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Two-step upload wizard presenter (mirrors `ProductForm` navigation).
 * Step 1 is the "upload file" screen, step 2 the "register URL" screen
 * (optional when a file was attached in step 1). Step state is pure UI;
 * validation runs in the container via `onValidateStep`. The submit button
 * ("Registrar e ingerir") only exists on step 2.
 */
export function DocumentUploadWizard({
  values,
  errors,
  fileResetKey,
  pending,
  docs,
  productOptions = [],
  categoryOptions = [],
  onFileChange,
  onChange,
  onValidateStep,
  onSubmit,
}: {
  values: DocumentWizardState;
  errors: Record<string, string>;
  fileResetKey: number;
  pending: boolean;
  docs: Dictionary['admin']['documents'];
  /** Friendly-name options; selection still stores the raw id in `values`. */
  productOptions?: readonly AssociationOption[];
  categoryOptions?: readonly AssociationOption[];
  onFileChange: (file: File | null) => void;
  onChange: (patch: Partial<DocumentWizardState>) => void;
  onValidateStep: (step: number) => Record<string, string>;
  onSubmit: () => void;
}) {
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const lastStep = 1;
  const stepTitles = [docs.uploadTitle, docs.urlTitle];

  const typeOptions = ADMIN_DOCUMENT_TYPES.map((value) => ({
    value,
    label: (docs as Record<string, string>)[`type_${value}`] ?? value,
  }));

  function handleNext() {
    const scoped = onValidateStep(step);
    if (Object.keys(scoped).length > 0) return;
    const next = Math.min(lastStep, step + 1);
    setMaxVisited((prev) => Math.max(prev, next));
    setStep(next);
  }

  function handleBack() {
    setStep((prev) => Math.max(0, prev - 1));
  }

  return (
    <Stack gap="md">
      <nav aria-label={docs.stepsLabel}>
        <ol className="flex flex-wrap items-center gap-2">
          {stepTitles.map((title, item) => {
            const reached = item <= maxVisited;
            const current = item === step;
            return (
              <li key={item} className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (reached) setStep(item);
                  }}
                  disabled={!reached || pending}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`${String(item + 1)}. ${title}`}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    current
                      ? 'border-primary/60 bg-primary-subtle text-foreground'
                      : reached
                        ? 'border-border bg-surface text-foreground hover:border-primary/50'
                        : 'cursor-not-allowed border-border bg-surface text-muted-foreground opacity-60',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full text-xs font-semibold',
                      current ? 'bg-primary text-primary-foreground' : 'bg-surface-raise',
                    )}
                  >
                    {item + 1}
                  </span>
                  {title}
                </button>
                {item < lastStep ? (
                  <span aria-hidden="true" className="hidden h-px w-4 bg-border lg:block" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      {step === 0 ? (
        <Stack gap="md">
          <Input
            key={fileResetKey}
            label={docs.fileLabel}
            name="file"
            type="file"
            accept=".pdf,.html,.htm,.md,.markdown,.txt"
            hint={docs.fileHint}
            error={errors['file']}
            disabled={pending}
            onChange={(event) => {
              onFileChange(event.target.files?.[0] ?? null);
            }}
          />
          <Input
            label={docs.titleLabel}
            name="title"
            value={values.title}
            error={errors['title']}
            disabled={pending}
            onChange={(event) => {
              onChange({ title: event.target.value });
            }}
          />
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-44 flex-1">
              <Select
                label={docs.typeLabel}
                name="type"
                value={values.type}
                options={typeOptions}
                disabled={pending}
                onChange={(event) => {
                  onChange({ type: event.target.value });
                }}
              />
            </div>
            <div className="min-w-44 flex-1">
              <Select
                label={docs.localeLabel}
                name="locale"
                value={values.locale}
                options={[
                  { value: 'en', label: 'en' },
                  { value: 'es', label: 'es' },
                ]}
                disabled={pending}
                onChange={(event) => {
                  onChange({ locale: event.target.value });
                }}
              />
            </div>
          </Stack>
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-44 flex-1">
              <AssociationSelect
                label={docs.productLabel}
                name="productId"
                value={values.productId}
                options={productOptions}
                placeholder={docs.productPlaceholder}
                searchPlaceholder={docs.productSearchPlaceholder}
                noResultsText={docs.associationNoResults}
                changeLabel={docs.associationChange}
                clearLabel={docs.associationClear}
                noSelectionLabel={docs.associationNoSelection}
                closeLabel={docs.associationClose}
                error={errors['productId']}
                disabled={pending}
                onSelect={(productId) => {
                  onChange({ productId });
                }}
              />
            </div>
            <div className="min-w-44 flex-1">
              <AssociationSelect
                label={docs.categoryLabel}
                name="categoryId"
                value={values.categoryId}
                options={categoryOptions}
                placeholder={docs.categoryPlaceholder}
                searchPlaceholder={docs.categorySearchPlaceholder}
                noResultsText={docs.associationNoResults}
                changeLabel={docs.associationChange}
                clearLabel={docs.associationClear}
                noSelectionLabel={docs.associationNoSelection}
                closeLabel={docs.associationClose}
                error={errors['categoryId']}
                disabled={pending}
                onSelect={(categoryId) => {
                  onChange({ categoryId });
                }}
              />
            </div>
          </Stack>
        </Stack>
      ) : null}

      {step === 1 ? (
        <Stack gap="md">
          <Text tone="muted">{docs.urlOptionalHint}</Text>
          {values.file !== null ? (
            <Text role="status">{docs.fileChosen.replace('{name}', values.file.name)}</Text>
          ) : null}
          <Input
            label={docs.titleLabel}
            name="urlTitle"
            value={values.title}
            error={errors['title']}
            disabled={pending}
            onChange={(event) => {
              onChange({ title: event.target.value });
            }}
          />
          <Input
            label={docs.urlLabel}
            name="sourceUrl"
            value={values.sourceUrl}
            placeholder="https://…"
            error={errors['sourceUrl']}
            disabled={pending}
            onChange={(event) => {
              onChange({ sourceUrl: event.target.value });
            }}
          />
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-44 flex-1">
              <Select
                label={docs.typeLabel}
                name="urlType"
                value={values.type}
                options={typeOptions}
                disabled={pending}
                onChange={(event) => {
                  onChange({ type: event.target.value });
                }}
              />
            </div>
            <div className="min-w-44 flex-1">
              <Select
                label={docs.localeLabel}
                name="urlLocale"
                value={values.locale}
                options={[
                  { value: 'en', label: 'en' },
                  { value: 'es', label: 'es' },
                ]}
                disabled={pending}
                onChange={(event) => {
                  onChange({ locale: event.target.value });
                }}
              />
            </div>
          </Stack>
        </Stack>
      ) : null}

      <Stack direction="horizontal" gap="md">
        <Button variant="secondary" onClick={handleBack} disabled={step === 0 || pending}>
          {docs.back}
        </Button>
        {step < lastStep ? (
          <Button onClick={handleNext} disabled={pending}>
            {docs.next}
          </Button>
        ) : null}
        {step === lastStep ? (
          <Button onClick={onSubmit} loading={pending}>
            {pending ? docs.registering : docs.urlSubmit}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
