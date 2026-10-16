import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminCategoriesView } from '@/features/admin/containers/admin-categories-view';
import type { AdminCategory } from '@/lib/api/admin';
import { getDictionarySync } from '@/lib/i18n/index';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const messages = getDictionarySync('es');

function category(id: string, name: string, slug: string): AdminCategory {
  return {
    id,
    name,
    slug,
    parentId: null,
    imageUrl: null,
    imageAlt: null,
    showInHome: true,
    translations: [],
  };
}

const data = [
  category('c1', 'Portátiles', 'portatiles'),
  category('c2', 'Memoria RAM', 'memoria-ram'),
];

function renderView() {
  return render(
    <AdminCategoriesView data={data} loadError={false} locale="es" messages={messages} />,
  );
}

describe('AdminCategoriesView filters', () => {
  it('filters by name while typing, like before', () => {
    renderView();

    fireEvent.change(screen.getByLabelText('Busca por nombre o slug…'), {
      target: { value: 'ram' },
    });
    expect(screen.queryByText('Portátiles')).toBeNull();
    expect(screen.getByText('Memoria RAM')).toBeDefined();
  });

  it('clears the name filter with the clear button', () => {
    renderView();

    const search = screen.getByLabelText('Busca por nombre o slug…');
    fireEvent.change(search, { target: { value: 'ram' } });
    expect(screen.queryByText('Portátiles')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByText('Portátiles')).toBeDefined();
    expect(screen.getByText('Memoria RAM')).toBeDefined();
    expect(search).toHaveProperty('value', '');
  });
});
