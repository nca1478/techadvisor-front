import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RegisterContainer } from './register-container';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('../session-context', () => ({
  useSession: () => ({ register: vi.fn() }),
}));

const baseProps = {
  locale: 'es',
  title: 'Crear una cuenta',
  subtitle: 'Una cuenta para pagar.',
  hasAccountPrompt: '¿Ya tienes cuenta?',
  signInCta: 'Iniciar sesión',
  messages: {
    email: 'Correo electrónico',
    password: 'Contraseña',
    name: 'Nombre (opcional)',
    submit: 'Crear cuenta',
  },
};

describe('RegisterContainer login link', () => {
  it('links to /ingresar without next when landing on home', () => {
    render(<RegisterContainer {...baseProps} next="/es" />);
    const link = screen.getByRole('link', { name: 'Iniciar sesión' });
    expect(link).toHaveAttribute('href', '/es/ingresar');
  });

  it('preserves ?next= in the login link', () => {
    render(<RegisterContainer {...baseProps} next="/es/checkout" />);
    const link = screen.getByRole('link', { name: 'Iniciar sesión' });
    expect(link).toHaveAttribute('href', '/es/ingresar?next=%2Fes%2Fcheckout');
  });
});
