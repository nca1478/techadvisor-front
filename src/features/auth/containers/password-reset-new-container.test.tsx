import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PasswordResetNewContainer } from './password-reset-new-container';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace, refresh: vi.fn() }),
}));

const copy = {
  title: 'Nueva contraseña',
  subtitleTemplate: 'Ingresa tu nueva contraseña para {email}',
  newPassword: 'Nueva contraseña',
  confirmPassword: 'Confirmar contraseña',
  showPassword: 'Mostrar',
  hidePassword: 'Ocultar',
  submit: 'Restablecer contraseña',
  passwordMin: 'La contraseña debe tener al menos 10 caracteres.',
  mismatch: 'Las contraseñas no coinciden.',
  required: 'Este campo es obligatorio.',
  backToLogin: '← Volver al login',
  successTitle: 'Contraseña restablecida exitosamente',
  successBody: 'Ahora puedes iniciar sesión con tu nueva contraseña',
  loginCta: 'Iniciar sesión',
  invalidToken: 'El enlace expiró.',
  genericError: 'No se pudo completar.',
};

describe('PasswordResetNewContainer', () => {
  it('renders the new-password form for the account email', () => {
    render(<PasswordResetNewContainer locale="es" email="ada@example.com" copy={copy} />);
    expect(screen.getByText('Ingresa tu nueva contraseña para ada@example.com')).toBeDefined();
    expect(screen.getByLabelText('Nueva contraseña')).toBeDefined();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Restablecer contraseña' })).toBeDefined();
  });
});
