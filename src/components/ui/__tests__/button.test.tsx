import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button';

describe('Button', () => {
  it('renders the primary medium button by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('bg-primary', 'h-10', 'cursor-pointer');
    expect(button).toHaveAttribute('type', 'button');
  });

  it.each([
    ['primary', 'bg-primary'],
    ['secondary', 'border-border-strong'],
    ['dark', 'bg-surface-raise'],
    ['danger', 'bg-destructive'],
    ['ghost', 'hover:bg-surface'],
    ['link', 'hover:underline'],
  ] as const)('applies the %s variant', (variant, expectedClass) => {
    render(<Button variant={variant}>Action</Button>);
    expect(screen.getByRole('button', { name: 'Action' })).toHaveClass(expectedClass);
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('applies the %s size', (size, expectedClass) => {
    render(<Button size={size}>Action</Button>);
    expect(screen.getByRole('button', { name: 'Action' })).toHaveClass(expectedClass);
  });

  it('disables interaction while loading and announces busy state', () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('supports the disabled state', () => {
    render(<Button disabled>Action</Button>);
    expect(screen.getByRole('button', { name: 'Action' })).toBeDisabled();
  });

  it('renders an anchor when href is given and stays keyboard-focusable', () => {
    render(<Button href="/cart">Go to cart</Button>);
    const link = screen.getByRole('link', { name: 'Go to cart' });
    expect(link).toHaveAttribute('href', '/cart');
    link.focus();
    expect(link).toHaveFocus();
  });

  it('falls back to a disabled button when href and disabled combine', () => {
    render(
      <Button href="/cart" disabled>
        Go to cart
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Go to cart' })).toBeDisabled();
  });

  it('forwards clicks and submits when type is submit', () => {
    const onClick = vi.fn();
    render(
      <Button type="submit" onClick={onClick}>
        Pay
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Pay' });
    expect(button).toHaveAttribute('type', 'submit');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
