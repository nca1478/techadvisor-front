'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { LOCALES, type Locale } from '@/lib/i18n/config';

const CURRENCY_KEY = 'techadvisor-currency';

/** Reads the presentation-only currency (query wins, then localStorage). */
export function readCurrency(searchParams: URLSearchParams, fallback: string): string {
  return searchParams.get('currency') ?? localStorageSafeGet() ?? fallback;
}

function localStorageSafeGet(): string | null {
  try {
    return window.localStorage.getItem(CURRENCY_KEY);
  } catch {
    return null;
  }
}

function localStorageSafeSet(value: string): void {
  try {
    window.localStorage.setItem(CURRENCY_KEY, value);
  } catch {
    // Storage unavailable (private mode): query param still applies.
  }
}

/** Locale switcher: same path + query under a different locale prefix. */
export function useLocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (locale: Locale) => {
      const segments = pathname.split('/');
      segments[1] = locale;
      const query = searchParams.toString();
      router.push(`${segments.join('/')}${query ? `?${query}` : ''}`);
    },
    [pathname, router, searchParams],
  );
}

/** Currency switcher: same URL with `?currency=` + localStorage persistence. */
export function useCurrencySwitcher(fallback: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('currency') ?? fallback;

  const switchCurrency = useCallback(
    (currency: string) => {
      localStorageSafeSet(currency);
      const next = new URLSearchParams(searchParams.toString());
      next.set('currency', currency);
      router.push(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return { current, switchCurrency };
}

export { CURRENCY_KEY, LOCALES };
