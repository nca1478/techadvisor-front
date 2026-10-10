'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { COMPARE_MAX_PRODUCTS } from '@/lib/api/compare';

const STORAGE_KEY = 'techadvisor:compare-selection';

function readStored(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

export interface CompareSelection {
  ids: string[];
  count: number;
  isFull: boolean;
  isSelected: (productId: string) => boolean;
  canAdd: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  compareHref: (locale: string) => string | null;
}

const CompareSelectionContext = createContext<CompareSelection | null>(null);

/**
 * Comparar-selection provider: hasta 3 productos, persistido en
 * localStorage. La página `/comparar` lee los ids desde la URL
 * (`?ids=a,b,c`), así que la selección sobrevive a recargas y compartidos.
 */
export function CompareSelectionProvider({ children }: { children: ReactNode }) {
  // Perezoso desde localStorage (con guarda SSR); la URL de `/comparar`
  // sigue siendo la fuente de verdad al compartir o recargar.
  const [ids, setIds] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : readStored().slice(0, COMPARE_MAX_PRODUCTS),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Private mode: la selección simplemente no persiste.
    }
  }, [ids]);

  const toggle = useCallback((productId: string) => {
    setIds((prev) => {
      if (prev.includes(productId)) return prev.filter((id) => id !== productId);
      if (prev.length >= COMPARE_MAX_PRODUCTS) return prev;
      return [...prev, productId];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clear = useCallback(() => {
    setIds([]);
  }, []);

  const value = useMemo<CompareSelection>(
    () => ({
      ids,
      count: ids.length,
      isFull: ids.length >= COMPARE_MAX_PRODUCTS,
      isSelected: (productId: string) => ids.includes(productId),
      canAdd: (productId: string) => ids.includes(productId) || ids.length < COMPARE_MAX_PRODUCTS,
      toggle,
      remove,
      clear,
      compareHref: (locale: string) =>
        ids.length >= 2 ? `/${locale}/comparar?ids=${ids.map(encodeURIComponent).join(',')}` : null,
    }),
    [ids, toggle, remove, clear],
  );

  return (
    <CompareSelectionContext.Provider value={value}>{children}</CompareSelectionContext.Provider>
  );
}

export function useCompareSelection(): CompareSelection {
  const context = useContext(CompareSelectionContext);
  if (!context) {
    throw new Error('useCompareSelection must be used within a CompareSelectionProvider');
  }
  return context;
}
