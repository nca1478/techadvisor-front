'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { cn } from '@/components/ui/cn';
import type { CategoryFormErrors, CategoryFormState } from '@/features/admin/lib/category-submit';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Wizard presenter for create/edit category, mirroring the product form
 * wizard. Step state lives here (pure UI); validation lives in the
 * container via `onValidateStep` so the single source of truth
 * (`validateCategoryForm`) stays in one place.
 *
 * Steps: 1 identity (name/slug/parent), 2 cover image, 3 optional
 * translation + save (submit only on the last step).
 */
export function CategoryForm({
  values,
  errors,
  parents,
  locales,
  defaultLocale,
  onChange,
  onValidateStep,
  onSubmit,
  pending,
  submitLabel,
  submitPendingLabel,
  footerNote,
  freeNavigation = false,
  formMessages,
}: {
  values: CategoryFormState;
  errors: CategoryFormErrors;
  parents: Array<{ value: string; label: string }>;
  locales: string[];
  defaultLocale: string;
  onChange: (patch: Partial<CategoryFormState>) => void;
  onValidateStep: (step: number) => CategoryFormErrors;
  onSubmit: () => void;
  pending: boolean;
  submitLabel: string;
  submitPendingLabel: string;
  footerNote?: ReactNode;
  /**
   * Edit mode only: every step pill is clickable and Next never blocks
   * (validation still runs so inline errors show; the final save
   * revalidates everything). Create keeps sequential navigation.
   */
  freeNavigation?: boolean;
  formMessages: Dictionary['admin']['categoryForm'];
}) {
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const lastStep = 2;

  const otherLocales = locales.filter((locale) => locale !== defaultLocale);
  const previewUrl = values.imageUrl.trim();

  const stepTitles = [formMessages.step1Title, formMessages.step2Title, formMessages.step3Title];

  function goTo(target: number) {
    if (freeNavigation || target <= maxVisited) {
      setStep(target);
    }
  }

  function handleNext() {
    const scoped = onValidateStep(step);
    if (!freeNavigation && Object.keys(scoped).length > 0) return;
    const next = Math.min(lastStep, step + 1);
    setMaxVisited((prev) => Math.max(prev, next));
    setStep(next);
  }

  function handleBack() {
    setStep((prev) => Math.max(0, prev - 1));
  }

  // Single-line scrollable stepper below `lg`: arrows reveal the pills
  // that overflow (same pattern as the product wizard + admin nav).
  const listRef = useRef<HTMLOListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateArrows = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setCanScrollPrev(list.scrollLeft > 1);
    setCanScrollNext(list.scrollLeft + list.clientWidth < list.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => {
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  // Keep the active pill visible when the step changes (mobile strip).
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>(`[data-step="${String(step)}"]`);
    if (list && active && typeof list.scrollTo === 'function') {
      const left = active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2;
      list.scrollTo({ left, behavior: 'smooth' });
    }
    updateArrows();
  }, [step, updateArrows]);

  function scrollSteps(direction: -1 | 1) {
    const list = listRef.current;
    if (!list || typeof list.scrollBy !== 'function') return;
    list.scrollBy({ left: direction * Math.max(160, list.clientWidth * 0.6), behavior: 'smooth' });
  }

  return (
    <Stack gap="md">
      <nav aria-label={formMessages.stepsLabel}>
        <div className="relative">
          <ol
            ref={listRef}
            onScroll={updateArrows}
            className="flex flex-nowrap items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible lg:py-0"
          >
            {stepTitles.map((title, item) => {
              const reached = freeNavigation || item <= maxVisited;
              const current = item === step;
              return (
                <li key={item} className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    data-step={item}
                    onClick={() => {
                      goTo(item);
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
          {canScrollPrev ? (
            <button
              type="button"
              aria-label={formMessages.stepsScrollPrev}
              onClick={() => {
                scrollSteps(-1);
              }}
              className="absolute top-1/2 left-0 size-8 -translate-y-1/2 cursor-pointer rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto size-4"
              >
                <path d="M10 3 5 8l5 5" />
              </svg>
            </button>
          ) : null}
          {canScrollNext ? (
            <button
              type="button"
              aria-label={formMessages.stepsScrollNext}
              onClick={() => {
                scrollSteps(1);
              }}
              className="absolute top-1/2 right-0 size-8 -translate-y-1/2 cursor-pointer rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto size-4"
              >
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          ) : null}
        </div>
      </nav>

      {step === 0 ? (
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
        </Stack>
      ) : null}

      {step === 1 ? (
        <Stack gap="sm">
          <Text variant="lead" as="div">
            {formMessages.imageTitle}
          </Text>
          <Text variant="small" tone="muted">
            {formMessages.imageSubtitle}
          </Text>
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-52 flex-1">
              <Input
                label={formMessages.imageUrl}
                name="imageUrl"
                value={values.imageUrl}
                placeholder="https://…"
                hint={formMessages.imageHint}
                error={errors['imageUrl']}
                onChange={(event) => {
                  onChange({ imageUrl: event.target.value });
                }}
              />
            </div>
            <div className="min-w-52 flex-1">
              <Input
                label={formMessages.imageAlt}
                name="imageAlt"
                value={values.imageAlt}
                placeholder={formMessages.imageAltPlaceholder}
                error={errors['imageAlt']}
                onChange={(event) => {
                  onChange({ imageAlt: event.target.value });
                }}
              />
            </div>
          </Stack>
          {previewUrl === '' ? null : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={values.imageAlt.trim() === '' ? formMessages.imagePreview : values.imageAlt}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-md border border-border object-cover"
            />
          )}
          <div className="flex items-start gap-2">
            <input
              id="category-showInHome"
              name="showInHome"
              type="checkbox"
              checked={values.showInHome}
              onChange={(event) => {
                onChange({ showInHome: event.target.checked });
              }}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <label htmlFor="category-showInHome" className="text-sm font-medium text-foreground">
              {formMessages.showInHome}
              <span className="block text-sm font-normal text-muted-foreground">
                {formMessages.showInHomeHint}
              </span>
            </label>
          </div>
        </Stack>
      ) : null}

      {step === 2 ? (
        <Stack gap="sm">
          {otherLocales.length > 0 ? (
            <>
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
            </>
          ) : (
            <Text variant="small" tone="muted">
              {formMessages.translationSubtitle}
            </Text>
          )}
        </Stack>
      ) : null}

      {footerNote}
      <Stack direction="horizontal" gap="md">
        <Button variant="secondary" onClick={handleBack} disabled={step === 0 || pending}>
          {formMessages.back}
        </Button>
        {step < lastStep ? (
          <Button onClick={handleNext} disabled={pending}>
            {formMessages.next}
          </Button>
        ) : null}
        {step === lastStep ? (
          <Button onClick={onSubmit} loading={pending}>
            {pending ? submitPendingLabel : submitLabel}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}
