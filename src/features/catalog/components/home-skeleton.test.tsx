import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeSkeleton } from './home-skeleton';

describe('HomeSkeleton', () => {
  it('announces loading with the localized label and no copy of its own', () => {
    render(<HomeSkeleton loadingLabel="Cargando…" />);
    const region = screen.getByRole('status', { name: 'Cargando…' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region.textContent.trim()).toBe('');
  });
});
