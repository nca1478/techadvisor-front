import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginContainer } from './login-container';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('../session-context', () => ({
  useSession: () => ({ login: vi.fn() }),
}));

const baseProps = {
  locale: 'es',
  title: 'Iniciar sesión',
  subtitle: 'Bienvenido de nuevo.',
  noAccountPrompt: '¿No tienes cuenta?',
  registerCta: 'Crear cuenta',
  messages: {
    email: 'Correo electrónico',
    password: 'Contraseña',
    submit: 'Iniciar sesión',
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
