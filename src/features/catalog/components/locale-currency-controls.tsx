'use client';

import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { useCurrencySwitcher, useLocaleSwitcher } from '../hooks/use-locale-currency';
import { LOCALES, type Locale } from '@/lib/i18n/config';

export interface SiteHeaderControlsProps {
  locale: Locale;
  currencies: string[];
  currencyFallback: string;
  languageLabel: string;
  currencyLabel: string;
}

/** Compact header controls: locale + currency selectors (client). */
export function LocaleCurrencyControls({
  locale,
  currencies,
  currencyFallback,
  languageLabel,
  currencyLabel,
}: SiteHeaderControlsProps) {
  const switchLocale = useLocaleSwitcher();
  const { current, switchCurrency } = useCurrencySwitcher(currencyFallback);

  return (
    <Stack direction="horizontal" gap="sm" align="center">
      <div className="w-20">
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
      <div className="w-24">
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
    </Stack>
  );
}
