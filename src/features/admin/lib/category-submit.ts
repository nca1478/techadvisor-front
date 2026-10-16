import type { AdminCategory, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/api/admin';
import { asOptionalId } from '@/lib/api/admin';
import { isHttpsUrl, slugField } from '@/features/admin/lib/admin-schemas';

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export interface CategoryFormState {
  name: string;
  slug: string;
  /** Empty string = root level; otherwise the parent category id. */
  parentId: string;
  /** Empty = no translation. */
  translationLocale: string;
  translationName: string;
  /** Single cover image URL (empty = no image), same https rule as products. */
  imageUrl: string;
  imageAlt: string;
  /** Home "shop by category" visibility. */
  showInHome: boolean;
}

export type CategoryFormErrors = Partial<
  Record<'name' | 'slug' | 'parentId' | 'translation' | 'imageUrl' | 'imageAlt', string>
>;

export interface CategoryValidationTexts {
  required: string;
  slugInvalid: string;
  urlInvalid: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

/**
 * Shared create/edit validation: required name, slug shape, parent either
 * empty or UUID, single https cover image (empty = none, like products),
 * alt max 200, and translation name required whenever a locale is
 * picked. Returns inline errors keyed by field; the container builds the
 * request body only when `errors` is empty.
 */
export function validateCategoryForm(
  values: CategoryFormState,
  texts: CategoryValidationTexts,
): CategoryFormErrors {
  const errors: CategoryFormErrors = {};
  if (values.name.trim() === '') errors['name'] = texts.required;
  if (!slugField.safeParse(values.slug).success) errors['slug'] = texts.slugInvalid;
  if (values.parentId.trim() !== '' && !isUuid(values.parentId))
    errors['parentId'] = texts.required;
  if (values.translationLocale.trim() !== '' && values.translationName.trim() === '') {
    errors['translation'] = texts.required;
  }
  if (values.imageUrl.trim() !== '' && !isHttpsUrl(values.imageUrl.trim())) {
    errors['imageUrl'] = texts.urlInvalid;
  }
  if (values.imageAlt.trim().length > 200) errors['imageAlt'] = texts.required;
  return errors;
}

/**
 * Error keys belonging to each wizard step: 0 = identity
 * (name/slug/parent), 1 = cover image, 2 = translation (optional, never
 * blocks — the final save validates everything).
 */
export function categoryStepErrorKeys(step: number): string[] {
  switch (step) {
    case 0:
      return ['name', 'slug', 'parentId'];
    case 1:
      return ['imageUrl', 'imageAlt'];
    default:
      return [];
  }
}

/** Filters a full `validateCategoryForm` error map down to one wizard step. */
export function categoryErrorsForStep(
  errors: CategoryFormErrors,
  step: number,
): CategoryFormErrors {
  if (step !== 0 && step !== 1) return {};
  const keys = categoryStepErrorKeys(step);
  const scoped: CategoryFormErrors = {};
  for (const [key, message] of Object.entries(errors)) {
    if (keys.includes(key)) {
      scoped[key as keyof CategoryFormErrors] = message;
    }
  }
  return scoped;
}

function collectCategoryTranslations(values: CategoryFormState) {
  if (values.translationLocale.trim() === '' || values.translationName.trim() === '') {
    return [];
  }
  return [{ locale: values.translationLocale.trim(), name: values.translationName.trim() }];
}

export function buildCreateCategoryRequest(values: CategoryFormState): CreateCategoryRequest {
  const imageUrl = values.imageUrl.trim();
  const imageAlt = values.imageAlt.trim();
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    ...(values.parentId.trim() === '' ? {} : { parentId: values.parentId.trim() }),
    ...(imageUrl === '' ? {} : { imageUrl }),
    ...(imageAlt === '' ? {} : { imageAlt }),
    showInHome: values.showInHome,
    translations: collectCategoryTranslations(values),
  };
}

/**
 * Edit request: only changed fields are sent (the backend treats every
 * field as optional). `parentId` sends `null` when the category is moved
 * back to root level; translations replace the whole set, so an empty
 * translation list clears them. `imageUrl: null` clears the cover image.
 */
export function buildUpdateCategoryRequest(
  values: CategoryFormState,
  initial: {
    name: string;
    slug: string;
    parentId: string | null;
    translationLocale: string;
    translationName: string;
    imageUrl: string | null;
    imageAlt: string | null;
    showInHome: boolean;
  },
): UpdateCategoryRequest {
  const body: UpdateCategoryRequest = {};
  const name = values.name.trim();
  if (name !== initial.name) body.name = name;
  const slug = values.slug.trim();
  if (slug !== initial.slug) body.slug = slug;
  const parentId = values.parentId.trim() === '' ? null : values.parentId.trim();
  if (parentId !== initial.parentId) body.parentId = parentId;
  const imageUrl = values.imageUrl.trim() === '' ? null : values.imageUrl.trim();
  if (imageUrl !== initial.imageUrl) body.imageUrl = imageUrl;
  const imageAlt = values.imageAlt.trim() === '' ? null : values.imageAlt.trim();
  if (imageAlt !== initial.imageAlt) body.imageAlt = imageAlt;
  if (values.showInHome !== initial.showInHome) body.showInHome = values.showInHome;
  const nextTranslations = collectCategoryTranslations(values);
  const initialTranslations =
    initial.translationLocale === '' || initial.translationName === ''
      ? []
      : [{ locale: initial.translationLocale, name: initial.translationName }];
  if (JSON.stringify(nextTranslations) !== JSON.stringify(initialTranslations)) {
    body.translations = nextTranslations;
  }
  return body;
}

export interface CategoryFormInitial {
  name: string;
  slug: string;
  parentId: string | null;
  translationLocale: string;
  translationName: string;
  imageUrl: string | null;
  imageAlt: string | null;
  showInHome: boolean;
}

/** Builds form state + diff baseline from a server row (tolerates pre-contract rows). */
export function categoryFormInitial(category: AdminCategory): CategoryFormInitial {
  const translation = category.translations.length > 0 ? category.translations[0] : undefined;
  const raw = category as unknown as Record<string, unknown>;
  return {
    name: category.name,
    slug: category.slug,
    parentId: asOptionalId(category.parentId),
    translationLocale: translation?.locale ?? '',
    translationName: translation?.name ?? '',
    imageUrl: asNullableString(raw['imageUrl']),
    imageAlt: asNullableString(raw['imageAlt']),
    showInHome: typeof raw['showInHome'] === 'boolean' ? raw['showInHome'] : true,
  };
}

export interface CategoryTreeRow {
  category: AdminCategory;
  depth: number;
}

/**
 * Flattens categories for the admin table: roots first (alphabetical),
 * each followed by its children recursively. Orphans (parent id not in
 * the list) fall back to root level; a `seen` set guards against cycles
 * (the backend rejects them, this is only a render backstop).
 */
export function orderCategoriesForDisplay(categories: AdminCategory[]): CategoryTreeRow[] {
  const byParent = new Map<string | null, AdminCategory[]>();
  for (const category of categories) {
    const key = asOptionalId(category.parentId);
    const list = byParent.get(key) ?? [];
    list.push(category);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name) || (a.id < b.id ? -1 : 1));
  }
  const rows: CategoryTreeRow[] = [];
  const seen = new Set<string>();
  const visit = (parentKey: string | null, depth: number): void => {
    for (const category of byParent.get(parentKey) ?? []) {
      if (seen.has(category.id)) continue;
      seen.add(category.id);
      rows.push({ category, depth });
      visit(category.id, depth + 1);
    }
  };
  visit(null, 0);
  for (const category of categories) {
    if (!seen.has(category.id)) {
      seen.add(category.id);
      rows.push({ category, depth: 0 });
    }
  }
  return rows;
}
