'use client';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MobileHeaderMenu } from './mobile-header-menu';

describe('MobileHeaderMenu', () => {
  it('hides the actions until the trigger opens the dropdown', () => {
    render(
      <MobileHeaderMenu menuLabel="Menu">
        <span>Cart</span>
        <span>Login</span>
      </MobileHeaderMenu>,
    );

    expect(screen.queryByText('Cart')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('menu', { name: 'Menu' })).toBeVisible();
    expect(screen.getByText('Cart')).toBeVisible();
    expect(screen.getByText('Login')).toBeVisible();
  });

  it('closes the dropdown on Escape', () => {
    render(
      <MobileHeaderMenu menuLabel="Menu">
        <span>Cart</span>
      </MobileHeaderMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('menu', { name: 'Menu' })).toBeVisible();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('auto-hides when a menu option is clicked', () => {
    render(
      <MobileHeaderMenu menuLabel="Menu">
        <a href="https://example.com/cart">Cart</a>
        <button type="button">Theme</button>
      </MobileHeaderMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('menu', { name: 'Menu' })).toBeVisible();
    fireEvent.click(screen.getByRole('link', { name: 'Cart' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Theme' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
