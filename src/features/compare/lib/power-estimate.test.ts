import { describe, expect, it } from 'vitest';
import { estimatePower } from './power-estimate';
import type { CompareProduct } from '@/lib/api/compare';

function product(productId: string, name: string, specs: Record<string, unknown>): CompareProduct {
  return { productId, name, slug: productId, priceAmount: 10000, currency: 'USD', specs };
}

describe('estimatePower', () => {
  it('returns null when no product carries power specs', () => {
    expect(estimatePower([product('a', 'RAM', { ram_gb: 16 })])).toBeNull();
    expect(estimatePower([])).toBeNull();
  });

  it('estimates draw from TDP with base load plus headroom', () => {
    const estimate = estimatePower([
      product('cpu', 'CPU', { tdp_w: 65 }),
      product('gpu', 'GPU', { tdp_w: 165 }),
    ]);
    expect(estimate).not.toBeNull();
    // 100 W base + 65 + 165, recommended adds 20% headroom rounded up.
    expect(estimate?.estimatedW).toBe(330);
    expect(estimate?.requiredW).toBe(396);
    expect(estimate?.verdict).toBe('no-psu');
    expect(estimate?.strongestSupplyW).toBeNull();
  });

  it('marks a strong enough PSU as sufficient', () => {
    const estimate = estimatePower([
      product('cpu', 'CPU', { tdp_w: 65 }),
      product('psu', 'PSU', { wattage_w: 850 }),
    ]);
    expect(estimate?.estimatedW).toBe(165);
    expect(estimate?.requiredW).toBe(198);
    expect(estimate?.strongestSupplyW).toBe(850);
    expect(estimate?.verdict).toBe('sufficient');
  });

  it('marks an undersized PSU as insufficient', () => {
    const estimate = estimatePower([
      product('gpu', 'GPU', { tdp_w: 575 }),
      product('psu', 'PSU', { wattage_w: 600 }),
    ]);
    // 100 + 575 = 675 drawn, 810 required > 600 supplied.
    expect(estimate?.verdict).toBe('insufficient');
  });

  it('ignores malformed specs instead of guessing', () => {
    const estimate = estimatePower([
      product('cpu', 'CPU', { tdp_w: 'high' }),
      product('psu', 'PSU', { wattage_w: 850 }),
    ]);
    expect(estimate?.contributors).toEqual([]);
    expect(estimate?.estimatedW).toBe(100);
    expect(estimate?.verdict).toBe('unknown-tdp');
  });
});
