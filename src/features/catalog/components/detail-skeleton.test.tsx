import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DetailSkeleton } from './detail-skeleton';

describe('DetailSkeleton', () => {
  it('announces loading with the localized label and no copy of its own', () => {
    render(<DetailSkeleton loadingLabel="Cargando…" />);
    const region = screen.getByRole('status', { name: 'Cargando…' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region.textContent.trim()).toBe('');
  });
});
