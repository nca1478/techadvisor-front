'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { clearCompareSelection } from './compare-selection-context';

/**
 * Resetea la selección de comparar en cada navegación (cambio de ruta o de
 * query: paginación, filtros, ir a otra página y volver, atrás/adelante).
 * Sin UI y sin estado React: vacía el store y la barra (`CompareBar`) y los
 * checkboxes (`CompareToggle`), que se derivan de la selección, se
 * desmarcan juntos. Se monta una sola vez en el layout localizado.
 */
export function ResetCompareOnNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const current = `${pathname}?${searchParams.toString()}`;
    if (previous.current === null) {
      previous.current = current;
      return;
    }
    if (previous.current !== current) {
      previous.current = current;
      clearCompareSelection();
    }
  }, [pathname, searchParams]);

  return null;
}
