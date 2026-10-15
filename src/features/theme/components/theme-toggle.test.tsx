import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../theme-context';
import { ThemeToggle } from './theme-toggle';

const MESSAGES = { switchToLight: 'Switch to light mode', switchToDark: 'Switch to dark mode' };

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle messages={MESSAGES} />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  it('offers daylight while the lab sits dark', () => {
    renderToggle();
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });

  it('switches the ground and persists the choice', () => {
    renderToggle();
    const button = screen.getByRole('button', { name: 'Switch to light mode' });
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('techadvisor-theme')).toBe('light');
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('stays keyboard-focusable with a visible name', () => {
    renderToggle();
    const button = screen.getByRole('button', { name: 'Switch to light mode' });
    button.focus();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('title', 'Switch to light mode');
  });
});
