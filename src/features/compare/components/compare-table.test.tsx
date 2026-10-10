import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompareTable, formatCompareCell } from './compare-table';

const products = [
  {
    productId: 'a',
    name: 'Board A',
    slug: 'board-a',
    priceAmount: 10000,
    currency: 'USD',
    specs: {},
  },
  {
    productId: 'b',
    name: 'Board B',
    slug: 'board-b',
    priceAmount: 8000,
    currency: 'USD',
    specs: {},
  },
];

const messages = { feature: 'Feature', best: 'Best', missing: '—', priceRow: 'Price' };

describe('formatCompareCell', () => {
  it('renders missing, booleans and primitives', () => {
    expect(formatCompareCell(null, '—')).toBe('—');
    expect(formatCompareCell(undefined, '—')).toBe('—');
    expect(formatCompareCell(true, '—')).toBe('Sí');
    expect(formatCompareCell(16, '—')).toBe('16');
  });
});

describe('CompareTable', () => {
  it('formats the SQL price row and highlights the best column', () => {
    render(
      <CompareTable
        products={products}
        table={[
          { key: 'price_amount', values: [10000, 8000], best: [1], direction: 'lower' },
          { key: 'ram_gb', values: [16, null], best: [], direction: null },
        ]}
        locale="en"
        specLabels={{ ram_gb: 'RAM' }}
        messages={messages}
      />,
    );
    expect(screen.getByText('Price')).toBeVisible();
    expect(screen.getByText('RAM')).toBeVisible();
    const bestCell = screen.getByText('$80.00').closest('td');
    expect(bestCell?.getAttribute('data-best')).toBe('true');
    expect(screen.getByText('Best')).toBeVisible();
    // Null spec renders the missing placeholder.
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('links product names to their detail pages', () => {
    render(
      <CompareTable
        products={products}
        table={[{ key: 'price_amount', values: [10000, 8000], best: [], direction: null }]}
        locale="es"
        specLabels={{}}
        messages={messages}
      />,
    );
    expect(screen.getByRole('link', { name: 'Board A' })).toHaveAttribute(
      'href',
      '/es/productos/board-a',
    );
  });
});
