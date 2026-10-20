import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { GoogleCallbackContainer } from './google-callback-container';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  loginWithGoogle: vi.fn((): Promise<{ ok: true } | { ok: false; message: string }> =>
    Promise.resolve({ ok: true }),
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

vi.mock('../session-context', () => ({
  useSession: () => ({ loginWithGoogle: mocks.loginWithGoogle }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.loginWithGoogle.mockResolvedValue({ ok: true } as const);
  window.history.replaceState(null, '', '/es/ingresar/callback');
});

it('exchanges the redirect access token and follows the returned state', async () => {
  window.location.hash = '#access_token=tok123&state=/es/checkout';
  render(<GoogleCallbackContainer locale="es" pendingMessage="Iniciando sesión…" />);
  await waitFor(() => {
    expect(mocks.loginWithGoogle).toHaveBeenCalledWith({ accessToken: 'tok123' });
  });
  await waitFor(() => {
    expect(mocks.replace).toHaveBeenCalledWith('/es/checkout');
  });
});

it('falls back to /cuenta when there is no usable state', async () => {
  window.location.hash = '#access_token=tok123';
  render(<GoogleCallbackContainer locale="es" pendingMessage="Iniciando sesión…" />);
  await waitFor(() => {
    expect(mocks.replace).toHaveBeenCalledWith('/es/cuenta');
  });
});

it('redirects to /ingresar with an error when Google reports a cancellation', async () => {
  window.history.replaceState(null, '', '/es/ingresar/callback?error=access_denied');
  render(<GoogleCallbackContainer locale="es" pendingMessage="Iniciando sesión…" />);
  await waitFor(() => {
    expect(mocks.replace).toHaveBeenCalledWith('/es/ingresar?error=access_denied');
  });
  expect(mocks.loginWithGoogle).not.toHaveBeenCalled();
});

it('redirects to /ingresar with an error when the exchange fails', async () => {
  mocks.loginWithGoogle.mockResolvedValue({ ok: false, message: 'nope' });
  window.location.hash = '#access_token=tok123';
  render(<GoogleCallbackContainer locale="es" pendingMessage="Iniciando sesión…" />);
  await waitFor(() => {
    expect(mocks.replace).toHaveBeenCalledWith('/es/ingresar?error=access_denied');
  });
});

it('renders the pending message', () => {
  render(<GoogleCallbackContainer locale="es" pendingMessage="Iniciando sesión…" />);
  expect(screen.getByText('Iniciando sesión…')).toBeDefined();
});
