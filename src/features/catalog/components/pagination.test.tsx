import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './pagination';

describe('Pagination', () => {
  it('renders nothing on a single page', () => {
    const { container } = render(
      <Pagination
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        previousLabel="Previous"
        nextLabel="Next"
        statusLabel={(page, total) => `${String(page)} of ${String(total)}`}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders disabled buttons on a single page when alwaysVisible', () => {
    render(
      <Pagination
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        previousLabel="Previous"
        nextLabel="Next"
        statusLabel={(page, total) => `${String(page)} of ${String(total)}`}
        alwaysVisible
      />,
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('1 of 1');
  });

  it('navigates pages and announces the status', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={2}
        totalPages={5}
        onPageChange={onPageChange}
        previousLabel="Previous"
        nextLabel="Next"
        statusLabel={(page, total) => `${String(page)} of ${String(total)}`}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('2 of 5');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
