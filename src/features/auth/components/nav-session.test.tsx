import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '@/lib/api/auth';
import { NavSession } from './nav-session';

const push = vi.fn();
const refresh = vi.fn();
const logout = vi.fn((): Promise<void> => Promise.resolve());
const navState = { path: '/es' };
const sessionState: {
  status: 'authenticated' | 'unauthenticated';
  user: AuthUser | null;
} = {
  status: 'authenticated',
  user: { id: 'u-1', email: 'ada@example.com', role: 'CUSTOMER' } as AuthUser,
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => navState.path,
}));

vi.mock('../session-context', () => ({
  useSession: () => ({ status: sessionState.status, user: sessionState.user, logout }),
}));

const labels = {
  locale: 'es',
  loginLabel: 'Iniciar sesión',
  registerLabel: 'Crear cuenta',
  logoutLabel: 'Cerrar sesión',
  accountShortLabel: 'Cuenta',
  adminLabel: 'Admin',
};

beforeEach(() => {
  vi.clearAllMocks();
  navState.path = '/es';
  sessionState.status = 'authenticated';
  sessionState.user = { id: 'u-1', email: 'ada@example.com', role: 'CUSTOMER' } as AuthUser;
});

describe('NavSession logout', () => {
  it('shows a pointer cursor on the logout button', () => {
    render(<NavSession {...labels} />);
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toHaveClass('cursor-pointer');
  });

  it('refreshes server components after logout on a public page', async () => {
    render(<NavSession {...labels} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
    });
    expect(refresh).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('redirects home and refreshes when logging out from a private page', async () => {
    navState.path = '/es/cuenta';
    render(<NavSession {...labels} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
    });
    expect(push).toHaveBeenCalledWith('/es');
    expect(refresh).toHaveBeenCalled();
  });
});

describe('NavSession showLabel', () => {
  beforeEach(() => {
    sessionState.status = 'unauthenticated';
    sessionState.user = null;
  });

  it('shows one visible labeled row per icon when showLabel is set', () => {
    render(<NavSession {...labels} showLabel />);
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveTextContent(
      'Iniciar sesión',
    );
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveTextContent('Crear cuenta');
  });

  it('stays icon-only with screen-reader names by default', () => {
    render(<NavSession {...labels} />);
    expect(screen.getByText('Iniciar sesión')).toHaveClass('sr-only');
  });
});
