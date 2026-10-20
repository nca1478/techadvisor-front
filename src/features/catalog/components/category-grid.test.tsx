import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CatalogCategory } from '@/lib/api/catalog';
import { CategoryGrid } from './category-grid';

function category(overrides: Partial<CatalogCategory> = {}): CatalogCategory {
  return {
    id: 'c1',
    name: 'Laptops',
    slug: 'laptops',
    parentSlug: null,
    imageUrl: null,
    imageAlt: null,
    showInHome: true,
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
        locale="es"
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
        pageSize={2}
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
        locale="es"
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
        locale="es"
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
        locale="es"
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
        pageSize={2}
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
        locale="es"
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
      />,
    );

    const link = screen.getByRole('link', { name: 'Drones' });
    expect(link.querySelector('img')?.getAttribute('src')).toContain('placeholder.svg');
    expect(link).toHaveTextContent('Drones');
  });

  it('prefers the backend cover image over the curated slug photo', () => {
    const backendCover = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf';
    render(
      <CategoryGrid
        categories={[
          category({
            id: 'c8',
            name: 'Monitors',
            slug: 'monitors',
            imageUrl: backendCover as unknown as CatalogCategory['imageUrl'],
          }),
        ]}
        locale="es"
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
      />,
    );

    const link = screen.getByRole('link', { name: 'Monitors' });
    expect(link.querySelector('img')?.getAttribute('src')).toContain('photo-1527443224154');
  });

  it('paginates without scroll: 1 card per view with prev/next buttons', () => {
    render(
      <CategoryGrid
        categories={[
          category(),
          category({ id: 'c2', name: 'GPUs', slug: 'gpus' }),
          category({ id: 'c3', name: 'RAM', slug: 'ram' }),
        ]}
        locale="es"
        title="Compra por categoría"
        subtitle="Explora el catálogo por categoría."
        prevLabel="Categorías anteriores"
        nextLabel="Categorías siguientes"
      />,
    );

    const list = screen.getByRole('list', { name: 'Compra por categoría' });
    expect(list).toBeInTheDocument();
    expect(list.className).toContain('grid-cols-1');
    expect(list.className).toContain('md:grid-cols-2');
    expect(list.className).toContain('lg:grid-cols-3');
    // No scroll container anywhere.
    expect(list).not.toHaveClass('overflow-x-auto');
    expect(document.querySelector('.overflow-x-auto')).toBeNull();

    // jsdom has no matchMedia: perPage falls back to 1, so only the first card shows.
    expect(screen.getByRole('link', { name: 'Laptops' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'GPUs' })).not.toBeInTheDocument();

    const next = screen.getByRole('button', { name: 'Categorías siguientes' });
    const prev = screen.getByRole('button', { name: 'Categorías anteriores' });
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();

    fireEvent.click(next);
    expect(screen.queryByRole('link', { name: 'Laptops' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GPUs' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Categorías anteriores' }));
    expect(screen.getByRole('link', { name: 'Laptops' })).toBeInTheDocument();
  });
});
