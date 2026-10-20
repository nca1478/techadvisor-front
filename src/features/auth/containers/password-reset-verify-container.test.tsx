import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PasswordResetVerifyContainer } from './password-reset-verify-container';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const copy = {
  title: 'Verifica tu código',
  subtitleTemplate: 'Hemos enviado un código de 6 dígitos a {email}',
  verify: 'Verificar',
  resend: 'Reenviar código',
  resendCooldownTemplate: 'Reenviar en {sec}s',
  changeEmail: 'Cambiar email',
  invalidCode: 'Ingresa un código de 6 dígitos.',
  expiredCode: 'El código es inválido o expiró.',
  genericError: 'No se pudo completar.',
  rateLimitError: 'Demasiados intentos.',
};

describe('PasswordResetVerifyContainer', () => {
  it('renders six OTP boxes and the resend/change-email actions', () => {
    render(<PasswordResetVerifyContainer locale="es" email="ada@example.com" copy={copy} />);
    expect(
      screen.getByText('Hemos enviado un código de 6 dígitos a ada@example.com'),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: 'Verificar' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Reenviar código' })).toBeDefined();
    const change = screen.getByRole('link', { name: 'Cambiar email' });
    expect(change).toHaveAttribute('href', '/es/recuperar');
  });
});
