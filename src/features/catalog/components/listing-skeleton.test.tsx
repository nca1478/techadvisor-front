import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ListingSkeleton } from './listing-skeleton';

describe('ListingSkeleton', () => {
  it('announces loading with the localized label and the product grid shape', () => {
    render(<ListingSkeleton loadingLabel="Loading…" />);
    const region = screen.getByRole('status', { name: 'Loading…' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region.textContent.trim()).toBe('');
  });

  it('uses the featured columns for the product listing page', () => {
    const { container } = render(<ListingSkeleton loadingLabel="Loading…" columns="featured" />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
  });
});
