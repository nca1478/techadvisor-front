import { describe, expect, it } from 'vitest';
import {
  compatibilityHasErrors,
  parseCompatibilityResult,
  sortCompatibilityIssues,
  type CompatibilityIssue,
} from './compatibility';

function issue(overrides: Partial<CompatibilityIssue> = {}): CompatibilityIssue {
  return {
    rule: 'ram-type',
    severity: 'error',
    productIds: ['ram-id', 'board-id'],
    messageKey: 'ram-type.mismatch',
    message: 'Memory "RAM" is DDR4, but board "Board" only accepts DDR5.',
    ...overrides,
  };
}

describe('parseCompatibilityResult', () => {
  it('accepts the backend contract shape (deterministic engine, no LLM)', () => {
    const parsed = parseCompatibilityResult({
      compatible: false,
      issues: [issue()],
    });
    expect(parsed.compatible).toBe(false);
    expect(parsed.issues).toHaveLength(1);
  });

  it('rejects unknown shapes', () => {
    expect(() => parseCompatibilityResult(null)).toThrow();
    expect(() => parseCompatibilityResult({ compatible: true })).toThrow();
    expect(() => parseCompatibilityResult({ compatible: true, issues: [{ rule: 'x' }] })).toThrow();
  });
});

describe('sortCompatibilityIssues', () => {
  it('orders errors before warnings', () => {
    const warning = issue({ rule: 'b-build', severity: 'warning', messageKey: 'build.loose' });
    const error = issue({ rule: 'a-ram', severity: 'error', messageKey: 'ram-type.mismatch' });
    expect(sortCompatibilityIssues([warning, error]).map((item) => item.severity)).toEqual([
      'error',
      'warning',
    ]);
  });
});

describe('compatibilityHasErrors', () => {
  it('detects errors vs warnings only', () => {
    expect(
      compatibilityHasErrors([issue({ severity: 'warning', messageKey: 'build.loose' })]),
    ).toBe(false);
    expect(compatibilityHasErrors([issue()])).toBe(true);
    expect(compatibilityHasErrors([])).toBe(false);
  });
});
