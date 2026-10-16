'use client';

import { useEffect, useId, useRef, useState, type ComponentType } from 'react';
import { Select } from '@/components/ui/select';
import { EsFlagIcon, GbFlagIcon } from '@/components/ui/locale-flags';
import { useCurrencySwitcher, useLocaleSwitcher } from '../hooks/use-locale-currency';
import { LOCALES, type Locale } from '@/lib/i18n/config';

export interface SiteHeaderControlsProps {
  locale: Locale;
  currencies: string[];
  currencyFallback: string;
  languageLabel: string;
  currencyLabel: string;
}

const LOCALE_FLAGS: Record<Locale, ComponentType<{ className?: string }>> = {
  en: GbFlagIcon,
  es: EsFlagIcon,
};

/**
 * Compact header controls: visual locale menu (flag + code) plus the currency
 * select. The trigger matches the neighbouring header icon slots (same
 * padding, header tokens, tooltip + screen-reader name); the menu uses the
 * surface tokens. Closes on outside click, Escape, or selection.
 */
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

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const CurrentFlag = LOCALE_FLAGS[locale];

  return (
    <span className="inline-flex items-center gap-1 text-header-foreground">
      <div ref={containerRef} className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={`${languageLabel}: ${locale.toUpperCase()}`}
          title={languageLabel}
          onClick={() => {
            setOpen((prev) => !prev);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm p-1 text-header-foreground no-underline transition-colors duration-150 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {/* Fila interior de 24 px (h-6): con el p-1 el botón mide 32 px,
              igual que los iconos vecinos (size-6 + p-1). */}
          <span className="inline-flex h-6 items-center gap-1.5">
            <span className="inline-flex shrink-0 overflow-hidden rounded-xs ring-1 ring-inset ring-border">
              <CurrentFlag />
            </span>
            <span aria-hidden="true" className="text-sm font-semibold uppercase leading-none">
              {locale}
            </span>
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {open ? (
          <ul
            id={menuId}
            role="menu"
            aria-label={languageLabel}
            className="absolute right-0 top-full z-50 mt-1 min-w-32 rounded-md border border-border bg-surface py-1 shadow-lg"
          >
            {LOCALES.map((code) => {
              const Flag = LOCALE_FLAGS[code];
              const selected = code === locale;
              return (
                <li key={code} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    onClick={() => {
                      setOpen(false);
                      if (!selected) switchLocale(code);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="inline-flex shrink-0 overflow-hidden rounded-xs ring-1 ring-inset ring-border">
                      <Flag />
                    </span>
                    <span className={`uppercase ${selected ? 'font-semibold' : 'font-normal'}`}>
                      {code}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
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
