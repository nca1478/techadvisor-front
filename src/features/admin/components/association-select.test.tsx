import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssociationSelect } from '@/features/admin/components/association-select';

const OPTIONS = [
  { id: '11111111-1111-4111-8111-111111111111', label: 'Laptop 13', hint: 'LAP-13' },
  { id: '22222222-2222-4222-8222-222222222222', label: 'Laptop 15', hint: 'LAP-15' },
];

const TEXTS = {
  placeholder: 'Select a product…',
  searchPlaceholder: 'Type to filter products…',
  noResultsText: 'No matches for this filter.',
  changeLabel: 'Change',
  clearLabel: 'Clear',
  noSelectionLabel: 'No association',
  closeLabel: 'Close',
};

function renderSelect(overrides: Partial<Parameters<typeof AssociationSelect>[0]> = {}) {
  const onSelect = vi.fn();
  render(
    <AssociationSelect
      label="Product (optional)"
      name="productId"
      value=""
      options={OPTIONS}
      onSelect={onSelect}
      {...TEXTS}
      {...overrides}
    />,
  );
  return { onSelect };
}

describe('AssociationSelect', () => {
  it('shows the placeholder when empty and opens a filterable list', () => {
    renderSelect();
    fireEvent.click(screen.getByRole('button', { name: /Select a product/ }));
    expect(screen.getByRole('listbox')).toBeVisible();
    expect(screen.getByRole('option', { name: /Laptop 13/ })).toBeVisible();
    expect(screen.getByRole('option', { name: /Laptop 15/ })).toBeVisible();
  });

  it('filters options as the user types and selects the id', () => {
    const { onSelect } = renderSelect();
    fireEvent.click(screen.getByRole('button', { name: /Select a product/ }));
    fireEvent.change(screen.getByPlaceholderText(TEXTS.searchPlaceholder), {
      target: { value: 'lap-15' },
    });
    expect(screen.queryByRole('option', { name: /Laptop 13/ })).toBeNull();
    fireEvent.click(screen.getByRole('option', { name: /Laptop 15/ }));
    expect(onSelect).toHaveBeenCalledWith('22222222-2222-4222-8222-222222222222');
  });

  it('shows the friendly name when selected and clears back to empty', () => {
    const { onSelect } = renderSelect({ value: '11111111-1111-4111-8111-111111111111' });
    expect(screen.getByText('Laptop 13')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Clear/ }));
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('shows the empty option and no-results text', () => {
    renderSelect();
    fireEvent.click(screen.getByRole('button', { name: /Select a product/ }));
    expect(screen.getByRole('option', { name: 'No association' })).toBeVisible();
    fireEvent.change(screen.getByPlaceholderText(TEXTS.searchPlaceholder), {
      target: { value: 'zzz-no-match' },
    });
    expect(screen.getByText(TEXTS.noResultsText)).toBeVisible();
  });
});
