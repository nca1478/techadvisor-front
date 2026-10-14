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
  it('renders a flag menu button with the current locale initials', () => {
    renderControls();
    const trigger = screen.getByRole('button', { name: 'Idioma: ES' });
    expect(trigger).toBeVisible();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Menu stays closed until the trigger is pressed.
    expect(screen.queryByRole('menu', { name: 'Idioma' })).not.toBeInTheDocument();
  });

  it('opens the language menu on click and switches locale on selection', () => {
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: 'Idioma: ES' }));
    const menu = screen.getByRole('menu', { name: 'Idioma' });
    expect(menu).toBeVisible();
    expect(screen.getByRole('menuitemradio', { name: 'es' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: 'en' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'en' }));
    expect(push).toHaveBeenCalledWith('/en/productos');
    expect(screen.queryByRole('menu', { name: 'Idioma' })).not.toBeInTheDocument();
  });

  it('closes the language menu on Escape without switching locale', () => {
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: 'Idioma: ES' }));
    expect(screen.getByRole('menu', { name: 'Idioma' })).toBeVisible();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu', { name: 'Idioma' })).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('hides the currency select on single-currency operation (USD only)', () => {
    renderControls(['USD']);
    expect(screen.getByRole('button', { name: 'Idioma: ES' })).toBeVisible();
    expect(screen.queryByLabelText('Moneda')).not.toBeInTheDocument();
  });

  it('switches currency through the URL without new messages', () => {
    renderControls();
    fireEvent.change(screen.getByLabelText('Moneda'), { target: { value: 'EUR' } });
    expect(push).toHaveBeenCalledWith('/es/productos?currency=EUR');
  });
});
