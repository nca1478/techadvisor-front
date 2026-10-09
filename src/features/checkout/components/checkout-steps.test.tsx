import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CheckoutSteps } from './checkout-steps';

const messages = { address: 'Dirección', payment: 'Pago', done: 'Confirmación' };

describe('CheckoutSteps', () => {
  it('marks only the current step with aria-current', () => {
    render(<CheckoutSteps label="Compra" current={1} messages={messages} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute('aria-current', 'step');
    expect(items[1]).not.toHaveAttribute('aria-current');
    expect(items[2]).not.toHaveAttribute('aria-current');
    expect(screen.getByText('Dirección')).toBeVisible();
    expect(screen.getByText('Confirmación')).toBeVisible();
  });
});
