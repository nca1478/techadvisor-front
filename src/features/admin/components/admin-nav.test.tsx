import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminNav } from '@/features/admin/components/admin-nav';
import { getDictionarySync } from '@/lib/i18n/index';

const push = vi.fn();
let pathname = '/es/admin';
let range: string | null = '7d';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
  useSearchParams: () => ({ get: (key: string) => (key === 'range' ? range : null) }),
}));

const messages = getDictionarySync('es').admin;

function renderNav() {
  return render(<AdminNav locale="es" messages={messages} />);
}

describe('AdminNav range selector', () => {
  it('shows the range dropdown on the dashboard section and navigates on change', () => {
    pathname = '/es/admin';
    range = '7d';
    renderNav();

    const select = screen.getByRole('combobox', { name: 'Rango' });
    expect(select).toHaveValue('7d');
    expect(
      within(select as HTMLSelectElement).getByRole('option', { name: 'Hoy' }),
    ).toBeInTheDocument();

    fireEvent.change(select, { target: { value: '30d' } });
    expect(push).toHaveBeenCalledWith('/es/admin?range=30d');
  });

  it('hides the range dropdown outside the dashboard section', () => {
    pathname = '/es/admin/productos';
    range = null;
    renderNav();

    expect(screen.queryByRole('combobox', { name: 'Rango' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Productos' })).toBeInTheDocument();
  });
});
