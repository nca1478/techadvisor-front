import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocaleCurrencyControls } from './locale-currency-controls';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/es/productos',
  useSearchParams: () => new URLSearchParams(''),
}));

afterEach(() => {
  vi.clearAllMocks();
});

function renderControls(currencies: string[] = ['USD', 'EUR']) {
  render(
    <LocaleCurrencyControls
      locale="es"
      currencies={currencies}
      currencyFallback="USD"
      languageLabel="Idioma"
      currencyLabel="Moneda"
    />,
  );
}

describe('LocaleCurrencyControls', () => {
  it('renders compact selects with screen-reader labels and full option codes', () => {
    renderControls();
    const language = screen.getByLabelText('Idioma');
    const currency = screen.getByLabelText('Moneda');
    expect(language).toBeVisible();
    expect(currency).toBeVisible();
    // Truncation regression (ADR 0015): the full code must be readable.
    expect(screen.getByRole('option', { name: 'USD' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'EUR' })).toBeInTheDocument();
  });

  it('hides the currency select on single-currency operation (USD only)', () => {
    renderControls(['USD']);
    expect(screen.getByLabelText('Idioma')).toBeVisible();
    expect(screen.queryByLabelText('Moneda')).not.toBeInTheDocument();
  });
  it('switches currency through the URL without new messages', () => {
    renderControls();
    fireEvent.change(screen.getByLabelText('Moneda'), { target: { value: 'EUR' } });
    expect(push).toHaveBeenCalledWith('/es/productos?currency=EUR');
  });
});
