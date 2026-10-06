import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProductImage } from '@/lib/api/catalog';
import { ProductGallery } from './product-gallery';

const noAlt = null as unknown as ProductImage['alt'];
const sideAlt = 'Side view' as unknown as ProductImage['alt'];

describe('ProductGallery', () => {
  it('shows the placeholder when the product has no images', () => {
    render(<ProductGallery images={[]} productName="Test Laptop" />);
    const image = screen.getByAltText('Test Laptop');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder') as string);
  });

  it('renders every image in order with product-name alt fallback', () => {
    render(
      <ProductGallery
        productName="Test Laptop"
        images={[
          { url: 'https://placehold.co/600x400?text=One', alt: noAlt, position: 0 },
          { url: 'https://placehold.co/600x400?text=Two', alt: sideAlt, position: 1 },
        ]}
      />,
    );
    // Main frame + active thumbnail share the alt; both must resolve to the product name.
    expect(screen.getAllByAltText('Test Laptop')[0]).toBeVisible();
    expect(screen.getByRole('button', { name: 'Test Laptop (1)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Side view (2)' })).toBeVisible();
  });
});
