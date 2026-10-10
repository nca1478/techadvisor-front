'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
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

function persist(next: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode: la selección simplemente no persiste.
  }
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

type Listener = () => void;

const listeners = new Set<Listener>();
let cachedIds: string[] | null = null;

function emit(): void {
  for (const listener of [...listeners]) listener();
}

/**
 * Snapshot del store externo (localStorage + memoria). Relee el storage en
 * cada comprobación pero devuelve la referencia cacheada cuando no cambió
 * (exigido por `useSyncExternalStore`), así los cambios entre pestañas
 * también se recogen sin efectos adicionales.
 */
function getSelectionSnapshot(): string[] {
  // En el servidor (y sin ventana) siempre la referencia estable vacía:
  // el snapshot debe estar cacheado entre llamadas.
  if (typeof window === 'undefined') return EMPTY_SELECTION;
  const fresh = readStored().slice(0, COMPARE_MAX_PRODUCTS);
  if (cachedIds === null || !sameIds(cachedIds, fresh)) {
    cachedIds = fresh;
  }
  return cachedIds;
}

/** Snapshot estable para el servidor y la hidratación: siempre vacío. */
const EMPTY_SELECTION: string[] = [];

function getServerSelectionSnapshot(): string[] {
  return EMPTY_SELECTION;
}

function subscribeSelection(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setSelection(next: string[]): void {
  cachedIds = next.slice(0, COMPARE_MAX_PRODUCTS);
  persist(cachedIds);
  emit();
}

function toggleSelection(productId: string): void {
  const current = getSelectionSnapshot();
  if (current.includes(productId)) {
    setSelection(current.filter((id) => id !== productId));
    return;
  }
  if (current.length >= COMPARE_MAX_PRODUCTS) return;
  setSelection([...current, productId]);
}

function removeSelection(productId: string): void {
  const current = getSelectionSnapshot();
  if (current.includes(productId)) {
    setSelection(current.filter((id) => id !== productId));
  }
}

function clearSelection(): void {
  if (getSelectionSnapshot().length > 0) {
    setSelection([]);
  }
}

/**
 * Limpia la selección fuera de React (para el reseteo por navegación).
 * La barra y los checkboxes se derivan de la selección, así que ambos se
 * desmarcan juntos al vaciarla.
 */
export function clearCompareSelection(): void {
  clearSelection();
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
 * localStorage mediante un store externo (`useSyncExternalStore`), de modo
 * que el servidor y la hidratación renderizan siempre la selección vacía
 * y el cliente la hidrata tras montar, sin mismatch. La página `/comparar`
 * lee los ids desde la URL (`?ids=a,b,c`), así que la selección sobrevive
 * a recargas y compartidos.
 */
export function CompareSelectionProvider({ children }: { children: ReactNode }) {
  const ids = useSyncExternalStore(
    subscribeSelection,
    getSelectionSnapshot,
    getServerSelectionSnapshot,
  );

  const value = useMemo<CompareSelection>(
    () => ({
      ids,
      count: ids.length,
      isFull: ids.length >= COMPARE_MAX_PRODUCTS,
      isSelected: (productId: string) => ids.includes(productId),
      canAdd: (productId: string) => ids.includes(productId) || ids.length < COMPARE_MAX_PRODUCTS,
      toggle: toggleSelection,
      remove: removeSelection,
      clear: clearSelection,
      compareHref: (locale: string) =>
        ids.length >= 2 ? `/${locale}/comparar?ids=${ids.map(encodeURIComponent).join(',')}` : null,
    }),
    [ids],
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
