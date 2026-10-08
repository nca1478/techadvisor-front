import { describe, expect, it } from 'vitest';
import { formatSpecValue, humanizeSpecKey } from './spec-labels';

describe('humanizeSpecKey', () => {
  it('returns the translated label when present', () => {
    expect(humanizeSpecKey('ram_gb', { ram_gb: 'Memoria RAM' })).toBe('Memoria RAM');
  });

  it('falls back to a humanized key when the label is missing', () => {
    expect(humanizeSpecKey('custom_field', {})).toBe('Custom field');
    expect(humanizeSpecKey('socket', undefined)).toBe('Socket');
  });
});

describe('formatSpecValue', () => {
  it('appends units to numeric values with a known unit', () => {
    expect(formatSpecValue('ram_gb', 16)).toBe('16 GB');
    expect(formatSpecValue('weight_kg', 1.4)).toBe('1.4 kg');
    expect(formatSpecValue('socket', 'AM5')).toBe('AM5');
  });

  it('renders missing values as an em dash', () => {
    expect(formatSpecValue('cpu', null)).toBe('—');
    expect(formatSpecValue('cpu', '')).toBe('—');
  });
});
