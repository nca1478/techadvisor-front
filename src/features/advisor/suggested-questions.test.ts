import { describe, expect, it } from 'vitest';
import { suggestedQuestionKeys } from './suggested-questions';

describe('suggestedQuestionKeys', () => {
  it('returns laptop questions for the laptops category', () => {
    expect(suggestedQuestionKeys('laptops')).toHaveLength(3);
  });

  it('falls back to default for unknown categories', () => {
    expect(suggestedQuestionKeys('unknown')).toEqual(suggestedQuestionKeys('default'));
  });

  it('falls back to default for null', () => {
    expect(suggestedQuestionKeys(null)).toEqual(suggestedQuestionKeys('default'));
  });
});
