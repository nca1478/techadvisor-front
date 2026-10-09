/**
 * Static suggested questions per category slug (see ADR: simplest option,
 * no backend dependency). The widget falls back to `default` when the
 * product category has no entry.
 */
export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  laptops: ['suggested-laptops-battery', 'suggested-laptops-ram', 'suggested-laptops-warranty'],
  components: [
    'suggested-components-compat',
    'suggested-components-warranty',
    'suggested-components-manual',
  ],
  peripherals: [
    'suggested-peripherals-compat',
    'suggested-peripherals-warranty',
    'suggested-peripherals-manual',
  ],
  audio: ['suggested-audio-compat', 'suggested-audio-warranty', 'suggested-audio-manual'],
  accessories: [
    'suggested-accessories-compat',
    'suggested-accessories-warranty',
    'suggested-accessories-manual',
  ],
  default: ['suggested-default-specs', 'suggested-default-warranty', 'suggested-default-manual'],
};

const FALLBACK_KEY = 'default';

export function suggestedQuestionKeys(categorySlug: string | null | undefined): string[] {
  if (typeof categorySlug === 'string' && Object.hasOwn(SUGGESTED_QUESTIONS, categorySlug)) {
    return SUGGESTED_QUESTIONS[categorySlug];
  }
  return SUGGESTED_QUESTIONS[FALLBACK_KEY];
}
