import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PasswordResetRequestContainer } from './password-reset-request-container';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const copy = {
  title: '¿Olvidaste tu contraseña?',
  subtitle: 'Ingresa tu correo.',
  emailLabel: 'Correo electrónico',
  submit: 'Enviar código',
  invalidEmail: 'Ingresa un correo válido.',
  required: 'Este campo es obligatorio.',
  sentTitle: 'Código enviado exitosamente',
  sentBody: 'Revisa tu correo electrónico para continuar',
  continueCta: 'Continuar',
  emailNotFound: 'Este correo no está registrado.',
  passwordNotAllowed: 'No se puede cambiar la contraseña.',
  backToLogin: '← Volver al login',
  genericError: 'No se pudo completar.',
  rateLimitError: 'Demasiados intentos.',
};

describe('PasswordResetRequestContainer', () => {
  it('renders the email form and the back-to-login link', () => {
    render(<PasswordResetRequestContainer locale="es" copy={copy} />);
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeDefined();
    expect(screen.getByLabelText('Correo electrónico')).toBeDefined();
    const back = screen.getByRole('link', { name: '← Volver al login' });
    expect(back).toHaveAttribute('href', '/es/ingresar');
  });
});
