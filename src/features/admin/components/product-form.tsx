'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { cn } from '@/components/ui/cn';
import type {
  ProductFormErrors,
  ProductFormOption,
  ProductFormState,
} from '@/features/admin/lib/product-submit';
import type { SpecField } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

export interface ProductWizardExtraStep {
  title: string;
  content: ReactNode;
}

/**
 * Wizard presenter for create/edit product. Step state lives here (pure UI);
 * validation lives in the container via `onValidateStep` so the single
 * source of truth (`validateProductForm`) stays in one place.
 *
 * Base steps: 1 basic info, 2 catalog + price, 3 specifications,
 * 4 optional translation. Edit mode appends extra steps (images,
 * inventory) via `extraSteps`; create stays at 4 steps.
 */
export function ProductForm({
  mode,
  values,
  errors,
  brands,
  categories,
  specsFields,
  currencies,
  defaultLocale,
  locales,
  onChange,
  onValidateStep,
  onSubmit,
  pending,
  submitLabel,
  submitPendingLabel,
  footerNote,
  extraSteps = [],
  freeNavigation = false,
  formMessages,
  statusLabels,
}: {
  mode: 'create' | 'edit';
  values: ProductFormState;
  errors: ProductFormErrors;
  brands: ProductFormOption[];
  categories: ProductFormOption[];
  specsFields: SpecField[];
  currencies: string[];
  defaultLocale: string;
  locales: string[];
  onChange: (patch: Partial<ProductFormState>) => void;
  onValidateStep: (step: number) => Record<string, string>;
  onSubmit: () => void;
  pending: boolean;
  submitLabel: string;
  submitPendingLabel: string;
  footerNote?: ReactNode;
  extraSteps?: ProductWizardExtraStep[];
  /**
   * Edit mode only: every step pill is clickable and Next never blocks
   * (validation still runs so inline errors show; the final save
   * revalidates everything). Create keeps sequential navigation.
   */
  freeNavigation?: boolean;
  formMessages: Dictionary['admin']['productForm'];
  statusLabels: Dictionary['admin']['products'];
}) {
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const lastStep = 3 + extraSteps.length;

  const set = (patch: Partial<ProductFormState>) => {
    onChange(patch);
  };
  const setSpec = (key: string, value: string) => {
    onChange({ specsRaw: { ...values.specsRaw, [key]: value } });
  };
  const otherLocales = locales.filter((locale) => locale !== defaultLocale);

  const stepTitles = [
    formMessages.step1Title,
    formMessages.step2Title,
    formMessages.step3Title,
    formMessages.step4Title,
    ...extraSteps.map((extra) => extra.title),
  ];

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

  // Single-line scrollable stepper on small screens: arrows reveal the
  // pills that overflow. Desktop keeps the wrapping layout untouched.
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
  }, [updateArrows, stepTitles.length]);

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
          <Input
            label={formMessages.name}
            name="name"
            value={values.name}
            error={errors['name']}
            onChange={(event) => {
              set({ name: event.target.value });
            }}
          />
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-52 flex-1">
              <Input
                label={formMessages.sku}
                name="sku"
                value={values.sku}
                error={errors['sku']}
                onChange={(event) => {
                  set({ sku: event.target.value });
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
                  set({ slug: event.target.value });
                }}
              />
            </div>
          </Stack>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              {formMessages.description}
            </label>
            <textarea
              id="description"
              name="description"
              value={values.description}
              rows={6}
              aria-invalid={errors['description'] ? true : undefined}
              onChange={(event) => {
                set({ description: event.target.value });
              }}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
            {errors['description'] ? (
              <p role="alert" className="text-sm text-destructive">
                {errors['description']}
              </p>
            ) : null}
          </div>
        </Stack>
      ) : null}

      {step === 1 ? (
        <Stack gap="md">
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-52 flex-1">
              <Select
                label={formMessages.brand}
                name="brandId"
                value={values.brandId}
                options={brands}
                placeholder={formMessages.selectBrand}
                error={errors['brandId']}
                onChange={(event) => {
                  set({ brandId: event.target.value });
                }}
              />
            </div>
            <div className="min-w-52 flex-1">
              <Select
                label={formMessages.category}
                name="categoryId"
                value={values.categoryId}
                options={categories}
                placeholder={formMessages.selectCategory}
                error={errors['categoryId']}
                onChange={(event) => {
                  set({ categoryId: event.target.value, specsRaw: {} });
                }}
              />
            </div>
          </Stack>
          <Stack direction="horizontal" gap="md" wrap>
            <div className="min-w-52 flex-1">
              <Input
                label={formMessages.price}
                name="priceMajor"
                inputMode="decimal"
                value={values.priceMajor}
                hint={formMessages.priceHint.replace('{currency}', values.currency || '—')}
                error={errors['priceMajor']}
                onChange={(event) => {
                  set({ priceMajor: event.target.value });
                }}
              />
            </div>
            <div className="min-w-52 flex-1">
              <Select
                label={formMessages.currency}
                name="currency"
                value={values.currency}
                options={currencies.map((currency) => ({ value: currency, label: currency }))}
                error={errors['currency']}
                onChange={(event) => {
                  set({ currency: event.target.value });
                }}
              />
            </div>
            {mode === 'create' ? (
              <div className="min-w-52 flex-1">
                <Select
                  label={formMessages.status}
                  name="status"
                  value={values.status}
                  options={(['DRAFT', 'ACTIVE', 'ARCHIVED'] as const).map((status) => ({
                    value: status,
                    label: statusLabels[`status_${status}` as keyof typeof statusLabels],
                  }))}
                  onChange={(event) => {
                    set({ status: event.target.value as ProductFormState['status'] });
                  }}
                />
              </div>
            ) : null}
            {mode === 'create' ? (
              <div className="min-w-52 flex-1">
                <Input
                  label={formMessages.initialStock}
                  name="initialStock"
                  inputMode="numeric"
                  value={values.initialStock}
                  hint={formMessages.initialStockHint}
                  error={errors['initialStock']}
                  onChange={(event) => {
                    set({ initialStock: event.target.value });
                  }}
                />
              </div>
            ) : null}
          </Stack>
        </Stack>
      ) : null}

      {step === 2 ? (
        <Stack gap="sm">
          {specsFields.length === 0 ? null : (
            <Stack gap="sm">
              {specsFields.map((field) => {
                const error = errors[`specs.${field.key}`];
                const label = field.unit ? `${field.label} (${field.unit})` : field.label;
                if (field.type === 'boolean') {
                  return (
                    <Select
                      key={field.key}
                      label={label}
                      name={`specs.${field.key}`}
                      value={values.specsRaw[field.key] ?? ''}
                      options={[
                        { value: 'true', label: 'true' },
                        { value: 'false', label: 'false' },
                      ]}
                      placeholder="—"
                      error={error}
                      onChange={(event) => {
                        setSpec(field.key, event.target.value);
                      }}
                    />
                  );
                }
                if (field.type === 'enum') {
                  return (
                    <Select
                      key={field.key}
                      label={label}
                      name={`specs.${field.key}`}
                      value={values.specsRaw[field.key] ?? ''}
                      options={(field.options ?? []).map((option) => ({
                        value: option,
                        label: option,
                      }))}
                      placeholder="—"
                      error={error}
                      onChange={(event) => {
                        setSpec(field.key, event.target.value);
                      }}
                    />
                  );
                }
                return (
                  <Input
                    key={field.key}
                    label={label}
                    name={`specs.${field.key}`}
                    inputMode={field.type === 'string' ? 'text' : 'decimal'}
                    value={values.specsRaw[field.key] ?? ''}
                    error={error}
                    onChange={(event) => {
                      setSpec(field.key, event.target.value);
                    }}
                  />
                );
              })}
            </Stack>
          )}
        </Stack>
      ) : null}

      {step === 3 ? (
        <Stack gap="sm">
          {otherLocales.length > 0 ? (
            <>
              <Stack direction="horizontal" gap="md" wrap>
                <div className="min-w-52 flex-1">
                  <Select
                    label={formMessages.translationLocale}
                    name="translationLocale"
                    value={values.translationLocale}
                    options={otherLocales.map((locale) => ({ value: locale, label: locale }))}
                    placeholder="—"
                    onChange={(event) => {
                      set({ translationLocale: event.target.value });
                    }}
                  />
                </div>
                <div className="min-w-52 flex-1">
                  <Input
                    label={formMessages.translationName}
                    name="translationName"
                    value={values.translationName}
                    onChange={(event) => {
                      set({ translationName: event.target.value });
                    }}
                  />
                </div>
              </Stack>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="translationDescription"
                  className="text-sm font-medium text-foreground"
                >
                  {formMessages.translationDescription}
                </label>
                <textarea
                  id="translationDescription"
                  name="translationDescription"
                  value={values.translationDescription}
                  rows={3}
                  onChange={(event) => {
                    set({ translationDescription: event.target.value });
                  }}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              </div>
            </>
          ) : null}
        </Stack>
      ) : null}

      {extraSteps.map((extra, index) =>
        step === 4 + index ? (
          <div key={extra.title} className="min-w-0">
            {extra.content}
          </div>
        ) : null,
      )}

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
