import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getDictionarySync } from '@/lib/i18n/index';
import { estimatePower } from '../lib/power-estimate';
import { PowerEstimateCard } from './power-estimate-card';
import type { CompareProduct } from '@/lib/api/compare';

const messages = getDictionarySync('es').compare.page.power;

function product(productId: string, name: string, specs: Record<string, unknown>): CompareProduct {
  return { productId, name, slug: productId, priceAmount: 10000, currency: 'USD', specs };
}

describe('PowerEstimateCard', () => {
  it('renders contributors, totals and the sufficiency badge', () => {
    const estimate = estimatePower([
      product('cpu', 'Ryzen CPU', { tdp_w: 65 }),
      product('gpu', 'GPU Card', { tdp_w: 165 }),
      product('psu', 'PSU 850', { wattage_w: 850 }),
    ]);
    expect(estimate).not.toBeNull();
    if (estimate === null) throw new Error('expected a power estimate');
    render(<PowerEstimateCard estimate={estimate} messages={messages} />);
    expect(screen.getByRole('heading', { level: 2, name: messages.title })).toBeVisible();
    expect(screen.getByText('Ryzen CPU')).toBeVisible();
    expect(screen.getByText('65 W')).toBeVisible();
    expect(screen.getByText('330 W')).toBeVisible();
    expect(screen.getByText('396 W')).toBeVisible();
    expect(screen.getByText(messages.sufficient)).toBeVisible();
  });

  it('flags an undersized PSU as insufficient', () => {
    const estimate = estimatePower([
      product('gpu', 'GPU Card', { tdp_w: 575 }),
      product('psu', 'PSU 600', { wattage_w: 600 }),
    ]);
    if (estimate === null) throw new Error('expected a power estimate');
    render(<PowerEstimateCard estimate={estimate} messages={messages} />);
    expect(screen.getByText(messages.insufficient)).toBeVisible();
  });
});
