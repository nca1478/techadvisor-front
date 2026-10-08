import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CatalogCategory } from '@/lib/api/catalog';
import { CategoryNav } from './category-nav';

function category(overrides: Partial<CatalogCategory> = {}): CatalogCategory {
  return {
    id: 'c1',
    name: 'Laptops',
    slug: 'laptops',
    parentSlug: null,
    specsSchema: [],
    locale: 'en',
    ...overrides,
  };
}

describe('CategoryNav', () => {
  it('renders the view-all link plus one link per category', () => {
    render(
      <CategoryNav
        categories={[category(), category({ id: 'c2', name: 'GPUs', slug: 'gpus' })]}
        allLabel="All"
        navLabel="Categories"
        listHref="/en/productos"
        hrefFor={(slug) => `/en/productos?category=${slug}`}
      />,
    );

    expect(screen.getByText('All')).toHaveAttribute('href', '/en/productos');
    expect(screen.getByText('Laptops')).toHaveAttribute('href', '/en/productos?category=laptops');
    expect(screen.getByText('GPUs')).toHaveAttribute('href', '/en/productos?category=gpus');
  });

  it('renders nothing without categories', () => {
    const { container } = render(
      <CategoryNav
        categories={[]}
        allLabel="All"
        navLabel="Categories"
        listHref="/en/productos"
        hrefFor={(slug) => `/en/productos?category=${slug}`}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
