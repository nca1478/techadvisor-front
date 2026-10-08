import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '@/components/ui/select';

describe('Select', () => {
  it('associates the visible label with the control', () => {
    render(
      <Select
        label="Category"
        name="category"
        value=""
        placeholder="All categories"
        options={[{ value: 'laptops', label: 'Laptops' }]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Category')).toBeVisible();
    expect(screen.getByText('All categories')).toBeVisible();
  });

  it('announces errors with role=alert and aria-invalid', () => {
    const onChange = vi.fn();
    render(
      <Select
        label="Sort"
        name="sort"
        value=""
        error="Pick a sort order."
        options={[{ value: 'price_asc', label: 'Price' }]}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a sort order.');
    const control = screen.getByLabelText('Sort');
    expect(control).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(control, { target: { value: 'price_asc' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('keeps the label accessible when visually hidden', () => {
    render(
      <Select
        label="Language"
        labelHidden
        name="locale"
        value="es"
        options={[
          { value: 'es', label: 'ES' },
          { value: 'en', label: 'EN' },
        ]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Language')).toBeVisible();
    expect(screen.getByText('Language')).toHaveClass('sr-only');
  });
});
