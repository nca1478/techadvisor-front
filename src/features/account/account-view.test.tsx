import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '@/lib/api/auth';
import { getDictionarySync } from '@/lib/i18n/index';
import { normalizeAccountTab } from './account-tab';
import { AccountView } from './containers/account-view';

vi.mock('@/features/auth/session-context', () => ({
  useSession: () => ({ refresh: vi.fn() }),
}));

const messages = getDictionarySync('es').account;

const user = {
  id: 'u-1',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  role: 'CUSTOMER',
  createdAt: '2026-10-06T12:00:00.000Z',
  updatedAt: '2026-10-06T12:00:00.000Z',
} as unknown as AuthUser;

function renderView(defaultTab: 'perfil' | 'pedidos' = 'perfil') {
  render(
    <AccountView
      user={user}
      orders={[]}
      loadError={false}
      locale="es"
      defaultTab={defaultTab}
      messages={messages}
    />,
  );
}

describe('normalizeAccountTab', () => {
  it('selects pedidos only for the exact ?tab=pedidos value', () => {
    expect(normalizeAccountTab('pedidos')).toBe('pedidos');
    expect(normalizeAccountTab('perfil')).toBe('perfil');
    expect(normalizeAccountTab(undefined)).toBe('perfil');
    expect(normalizeAccountTab('PEDIDOS')).toBe('perfil');
  });
});

describe('AccountView tabs', () => {
  it('shows the editable profile form by default, with email and role read-only', () => {
    renderView();
    expect(screen.getByRole('tab', { name: 'Perfil', selected: true })).toBeDefined();
    expect(screen.getByDisplayValue('Ada Lovelace')).toBeDefined();
    const email = screen.getByLabelText('Correo electrónico');
    const role = screen.getByLabelText('Rol');
    expect(email).toHaveValue('ada@example.com');
    expect(email).toBeDisabled();
    expect(role).toHaveValue('CUSTOMER');
    expect(role).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDefined();
  });

  it('switches to the orders tab on click', () => {
    renderView();
    fireEvent.click(screen.getByRole('tab', { name: 'Pedidos' }));
    expect(screen.getByRole('tab', { name: 'Pedidos', selected: true })).toBeDefined();
    expect(screen.getByText(messages.empty)).toBeDefined();
  });

  it('pre-selects the orders tab for ?tab=pedidos deep-links', () => {
    renderView('pedidos');
    expect(screen.getByRole('tab', { name: 'Pedidos', selected: true })).toBeDefined();
    expect(screen.getByText(messages.empty)).toBeDefined();
  });
});
