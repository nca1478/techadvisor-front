import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompatibilityAlert } from './compatibility-alert';

const products = [
  { id: 'ram-id', slug: 'mock-ram-ddr4', name: 'Mock RAM DDR4' },
  { id: 'board-id', slug: 'mock-board-ddr5', name: 'Mock Board DDR5' },
];

const labels = {
  title: 'Compatibilidad',
  okLabel: 'Compatible',
  errorBadge: 'Error',
  warningBadge: 'Aviso',
  viewProductLabel: 'Ver producto',
};

describe('CompatibilityAlert', () => {
  it('shows the ok state when the engine finds no issues', () => {
    render(
      <CompatibilityAlert compatible issues={[]} products={products} locale="es" {...labels} />,
    );
    expect(screen.getByText('Compatible')).toBeVisible();
  });

  it('shows deterministic errors with links to the affected products', () => {
    render(
      <CompatibilityAlert
        compatible={false}
        issues={[
          {
            rule: 'ram-type',
            severity: 'error',
            productIds: ['ram-id', 'board-id'],
            messageKey: 'ram-type.mismatch',
            message: 'La memoria "Mock RAM DDR4" es DDR4, pero la placa solo acepta DDR5.',
          },
        ]}
        products={products}
        locale="es"
        {...labels}
      />,
    );
    expect(screen.getByText('Error')).toBeVisible();
    expect(screen.getByText(/es DDR4, pero la placa/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver producto: Mock RAM DDR4' })).toHaveAttribute(
      'href',
      '/es/productos/mock-ram-ddr4',
    );
    expect(screen.getByRole('link', { name: 'Ver producto: Mock Board DDR5' })).toHaveAttribute(
      'href',
      '/es/productos/mock-board-ddr5',
    );
  });

  it('shows warnings with the warning badge', () => {
    render(
      <CompatibilityAlert
        compatible={false}
        issues={[
          {
            rule: 'build-shape',
            severity: 'warning',
            productIds: [],
            messageKey: 'build.loose-parts',
            message: 'Faltan datos de la fuente.',
          },
        ]}
        products={products}
        locale="es"
        {...labels}
      />,
    );
    expect(screen.getByText('Aviso')).toBeVisible();
  });
});
