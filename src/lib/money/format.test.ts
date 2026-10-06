import { describe, expect, it } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats minor units with the currency and locale', () => {
    expect(formatPrice(129900, 'USD', 'en')).toBe('$1,299.00');
    // ICU grouping varies by environment (narrow nbsp vs dot); assert value + symbol.
    const eur = formatPrice(129900, 'EUR', 'es');
    expect(eur).toContain('299,00');
    expect(eur).toContain('€');
  });

  it('uses zero fraction digits for zero-decimal currencies', () => {
    expect(formatPrice(1500, 'JPY', 'en')).toBe('¥1,500');
  });
});
