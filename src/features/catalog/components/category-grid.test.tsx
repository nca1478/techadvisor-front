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

  it('shows a related background photo with the title kept over it', () => {
    render(
      <CategoryGrid
        categories={[category()]}
        hrefFor={(slug) => `/es/productos?category=${slug}`}
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
      />,
    );

    const link = screen.getByRole('link', { name: 'Laptops' });
    const image = link.querySelector('img');
    expect(image?.getAttribute('src')).toContain('images.unsplash.com');
    // Decorative photo: the accessible name comes from the link, not the image.
    expect(image?.getAttribute('alt')).toBe('');
    expect(link).toHaveTextContent('Laptops');
  });

  it('prioritizes only the first (above-the-fold) photo for LCP', () => {
    render(
      <CategoryGrid
        categories={[category(), category({ id: 'c2', name: 'GPUs', slug: 'gpus' })]}
        hrefFor={(slug) => `/es/productos?category=${slug}`}
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
      />,
    );

    const first = screen.getByRole('link', { name: 'Laptops' }).querySelector('img');
    const second = screen.getByRole('link', { name: 'GPUs' }).querySelector('img');
    // `priority` renders an eager image (no loading="lazy"); the rest stay lazy.
    expect(first?.getAttribute('loading')).not.toBe('lazy');
    expect(second?.getAttribute('loading')).toBe('lazy');
  });

  it('falls back to the local placeholder for unknown slugs', () => {
    render(
      <CategoryGrid
        categories={[category({ id: 'c9', name: 'Drones', slug: 'drones' })]}
        hrefFor={(slug) => `/es/productos?category=${slug}`}
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
      />,
    );

    const link = screen.getByRole('link', { name: 'Drones' });
    expect(link.querySelector('img')?.getAttribute('src')).toContain('placeholder.svg');
    expect(link).toHaveTextContent('Drones');
  });
});
