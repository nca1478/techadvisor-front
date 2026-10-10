import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '@/lib/api/auth';
import { NavSession } from './nav-session';

const push = vi.fn();
const refresh = vi.fn();
const logout = vi.fn((): Promise<void> => Promise.resolve());
const navState = { path: '/es' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => navState.path,
}));

vi.mock('../session-context', () => ({
  useSession: () => ({
    status: 'authenticated',
    user: { id: 'u-1', email: 'ada@example.com', role: 'CUSTOMER' } as AuthUser,
    logout,
  }),
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
});

describe('NavSession logout', () => {
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
