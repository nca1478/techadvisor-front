import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CatalogCategory } from '@/lib/api/catalog';
import { CategoryGrid } from './category-grid';

function category(overrides: Partial<CatalogCategory> = {}): CatalogCategory {
  return {
    id: 'c1',
    name: 'Laptops',
    slug: 'laptops',
    parentSlug: null,
    specsSchema: [],
    locale: 'es',
    ...overrides,
  };
}

describe('CategoryGrid', () => {
  it('links each category by name without leaking the technical slug', () => {
    render(
      <CategoryGrid
        categories={[category(), category({ id: 'c2', name: 'GPUs', slug: 'gpus' })]}
        hrefFor={(slug) => `/es/productos?category=${slug}`}
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
      />,
    );

    expect(screen.getByRole('link', { name: 'Laptops' })).toHaveAttribute(
      'href',
      '/es/productos?category=laptops',
    );
    expect(screen.getByRole('link', { name: 'GPUs' })).toHaveAttribute(
      'href',
      '/es/productos?category=gpus',
    );
    expect(screen.queryByText('laptops')).not.toBeInTheDocument();
    expect(screen.queryByText('gpus')).not.toBeInTheDocument();
  });

  it('renders nothing without categories', () => {
    const { container } = render(
      <CategoryGrid
        categories={[]}
        hrefFor={(slug) => `/es/productos?category=${slug}`}
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
