import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs } from '../tabs';

const ITEMS = [
  { id: 'a', label: 'Primera', content: <p>Contenido A</p> },
  { id: 'b', label: 'Segunda', content: <p>Contenido B</p> },
  { id: 'c', label: 'Tercera', content: <p>Contenido C</p> },
];

describe('Tabs', () => {
  it('selects the first tab by default and shows only its panel', () => {
    render(<Tabs items={ITEMS} label="Secciones" />);
    expect(screen.getByRole('tab', { name: 'Primera' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Segunda' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Contenido A')).toBeVisible();
    expect(screen.queryByText('Contenido B')).not.toBeInTheDocument();
  });

  it('respects defaultId and switches panels on click', () => {
    render(<Tabs items={ITEMS} label="Secciones" defaultId="b" />);
    expect(screen.getByText('Contenido B')).toBeVisible();

    fireEvent.click(screen.getByRole('tab', { name: 'Tercera' }));
    expect(screen.getByRole('tab', { name: 'Tercera' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Contenido C')).toBeVisible();
    expect(screen.queryByText('Contenido B')).not.toBeInTheDocument();
  });

  it('moves selection with arrow keys (roving tabindex)', () => {
    render(<Tabs items={ITEMS} label="Secciones" />);
    const first = screen.getByRole('tab', { name: 'Primera' });
    expect(first).toHaveAttribute('tabindex', '0');

    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Segunda' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Contenido B')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Segunda' })).toHaveFocus();
  });

  it('applies an optional tablistClassName to the tab-button row only', () => {
    render(<Tabs items={ITEMS} label="Secciones" tablistClassName="max-w-md" />);
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveClass('flex', 'flex-wrap', 'gap-2', 'max-w-md');
    expect(screen.getByRole('tabpanel')).not.toHaveClass('max-w-md');
  });
});
