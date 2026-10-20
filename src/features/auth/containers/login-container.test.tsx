import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginContainer } from './login-container';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('../session-context', () => ({
  useSession: () => ({ login: vi.fn(), loginWithGoogle: vi.fn() }),
}));

const baseProps = {
  locale: 'es',
  title: 'Iniciar sesión',
  subtitle: 'Bienvenido de nuevo.',
  noAccountPrompt: '¿No tienes cuenta?',
  registerCta: 'Crear cuenta',
  forgotLink: '¿Olvidaste tu contraseña?',
  messages: {
    email: 'Correo electrónico',
    password: 'Contraseña',
    submit: 'Iniciar sesión',
  },
  google: {
    clientId: 'test-client-id.apps.googleusercontent.com',
    divider: 'o',
    buttonLabel: 'Continuar con Google',
    error: 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
  },
};

describe('LoginContainer register link', () => {
  it('links to /registro without next when landing on home', () => {
    render(<LoginContainer {...baseProps} next="/es" />);
    const link = screen.getByRole('link', { name: 'Crear cuenta' });
    expect(link).toHaveAttribute('href', '/es/registro');
  });

  it('preserves ?next= in the register link', () => {
    render(<LoginContainer {...baseProps} next="/es/checkout" />);
    const link = screen.getByRole('link', { name: 'Crear cuenta' });
    expect(link).toHaveAttribute('href', '/es/registro?next=%2Fes%2Fcheckout');
  });
});

describe('LoginContainer Google sign-in', () => {
  it('renders the divider and the Google button below the local form', () => {
    render(<LoginContainer {...baseProps} next="/es" />);
    expect(screen.getByText('o')).toBeDefined();
    expect(screen.getByTestId('google-signin-button')).toBeDefined();
  });

  it('hides the Google button when no client id is configured', () => {
    render(
      <LoginContainer {...baseProps} google={{ ...baseProps.google, clientId: '' }} next="/es" />,
    );
    expect(screen.queryByTestId('google-signin-button')).toBeNull();
  });
});
