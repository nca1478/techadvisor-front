'use client';

import { Select } from '@/components/ui/select';
import { useCurrencySwitcher, useLocaleSwitcher } from '../hooks/use-locale-currency';
import { LOCALES, type Locale } from '@/lib/i18n/config';

export interface SiteHeaderControlsProps {
  locale: Locale;
  currencies: string[];
  currencyFallback: string;
  languageLabel: string;
  currencyLabel: string;
}

/** Compact header controls: locale + currency selects (text codes, no icons). */
export function LocaleCurrencyControls({
  locale,
  currencies,
  currencyFallback,
  languageLabel,
  currencyLabel,
}: SiteHeaderControlsProps) {
  const switchLocale = useLocaleSwitcher();
  const { current, switchCurrency } = useCurrencySwitcher(currencyFallback);
  // Operación en moneda única (USD): sin alternativas no hay nada que elegir;
  // el selector reaparece solo cuando el backend anuncie 2+ monedas (EUR).
  const showCurrency = currencies.length > 1;

  return (
    <span className="inline-flex items-center gap-1 text-header-foreground">
      <div className="w-16">
        <Select
          label={languageLabel}
          labelHidden
          size="sm"
          name="locale"
          value={locale}
          options={LOCALES.map((code) => ({ value: code, label: code.toUpperCase() }))}
          onChange={(event) => {
            switchLocale(event.target.value as Locale);
          }}
        />
      </div>
      {showCurrency ? (
        <div className="w-20">
          <Select
            label={currencyLabel}
            labelHidden
            size="sm"
            name="currency"
            value={current}
            options={currencies.map((code) => ({ value: code, label: code }))}
            onChange={(event) => {
              switchCurrency(event.target.value);
            }}
          />
        </div>
      ) : null}
    </span>
  );
}
