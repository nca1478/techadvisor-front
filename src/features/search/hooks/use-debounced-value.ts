'use client';

import { useEffect, useState } from 'react';

/**
 * Returns `value` delayed by `delayMs` after its last change. Used to avoid
 * firing a suggestion request on every keystroke in the search bar.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debounced;
}
