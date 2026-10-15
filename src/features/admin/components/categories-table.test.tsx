import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategoriesTable } from './categories-table';
import type { AdminCategory } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

type CategoriesMessages = Dictionary['admin']['categories'];

const messages = {
  tableNumber: 'No',
  tableName: 'Category',
  tableSlug: 'Slug',
  tableImage: 'Image',
  tableHome: 'On home',
  tableParent: 'Parent',
  tableTranslations: 'Translations',
  tableActions: 'Actions',
  rootParent: 'Root',
  noTranslations: '—',
  noImage: 'No image',
  switchLabel: 'Show “{name}” on home',
  toggled: 'Visibility updated.',
  toggleError: 'Update failed.',
  edit: 'Edit',
  delete: 'Delete',
} as unknown as CategoriesMessages;

function category(overrides: Partial<AdminCategory> = {}): AdminCategory {
  return {
    id: 'c1',
    name: 'Laptops',
    slug: 'laptops',
    parentId: null,
    imageUrl: null,
    imageAlt: null,
    showInHome: true,
    translations: [],
    ...overrides,
  };
}

function renderTable(
  categories: AdminCategory[],
  props: Partial<Parameters<typeof CategoriesTable>[0]> = {},
) {
  const onDelete = vi.fn();
  const onToggleHome = vi.fn();
  render(
    <CategoriesTable
      rows={categories.map((entry) => ({ category: entry, depth: 0 }))}
      locale="en"
      messages={messages}
      homeOverrides={{}}
      pendingHomeId={null}
      onDelete={onDelete}
      onToggleHome={onToggleHome}
      {...props}
    />,
  );
  return { onDelete, onToggleHome };
}

describe('CategoriesTable home switch', () => {
  it('renders a checked switch for visible categories', () => {
    renderTable([category()]);
    const toggle = screen.getByRole('switch', { name: 'Show “Laptops” on home' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('renders an unchecked switch for hidden categories', () => {
    renderTable([category({ id: 'c2', name: 'Monitors', slug: 'monitors', showInHome: false })]);
    const toggle = screen.getByRole('switch', { name: 'Show “Monitors” on home' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onToggleHome with the flipped value', () => {
    const { onToggleHome } = renderTable([category()]);
    fireEvent.click(screen.getByRole('switch', { name: 'Show “Laptops” on home' }));
    expect(onToggleHome).toHaveBeenCalledWith('c1', false);
  });

  it('prefers the optimistic override and disables the switch while pending', () => {
    renderTable([category({ showInHome: true })], {
      homeOverrides: { c1: false },
      pendingHomeId: 'c1',
    });
    const toggle = screen.getByRole('switch', { name: 'Show “Laptops” on home' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toBeDisabled();
  });
});
