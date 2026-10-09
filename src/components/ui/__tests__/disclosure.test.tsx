import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Disclosure } from '../disclosure';

describe('Disclosure', () => {
  it('starts closed, toggles content with aria-expanded', () => {
    render(
      <Disclosure title="Filtros">
        <p>Contenido</p>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', { name: 'Filtros' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Contenido')).toBeVisible();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('respects defaultOpen and shows the active count badge', () => {
    render(
      <Disclosure title="Filtros" defaultOpen count={2}>
        <p>Contenido</p>
      </Disclosure>,
    );
    expect(screen.getByRole('button', { name: 'Filtros 2' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Contenido')).toBeVisible();
  });
});
