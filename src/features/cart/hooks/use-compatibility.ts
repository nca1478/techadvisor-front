'use client';

import { useEffect, useState } from 'react';
import {
  compatibilityHasErrors,
  parseCompatibilityResult,
  sortCompatibilityIssues,
  type CompatibilityCheckItem,
  type CompatibilityIssue,
} from '@/lib/api/compatibility';

export interface CompatibilityState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  compatible: boolean;
  issues: CompatibilityIssue[];
  hasErrors: boolean;
  error: string | null;
}

const IDLE: CompatibilityState = {
  status: 'idle',
  compatible: true,
  issues: [],
  hasErrors: false,
  error: null,
};

interface Entry extends CompatibilityState {
  key: string;
}

/**
 * Consulta `POST /api/compatibility/check` con los productos del carrito.
 * El veredicto viene del motor determinista del backend (reglas sobre
 * `specs`); el LLM no interviene. Se re-ejecuta cuando cambia el conjunto
 * de productos, sus cantidades o el idioma. Mientras la respuesta va en vuelo
 * se deriva `loading` durante el render (sin setState sincrónico en el efecto).
 */
export function useCompatibility(
  items: CompatibilityCheckItem[],
  locale: string,
): CompatibilityState {
  const sorted = [...items].sort((a, b) => a.productId.localeCompare(b.productId));
  const key = sorted.map((item) => `${item.productId}:${String(item.qty)}`).join(',');
  const [entry, setEntry] = useState<Entry>({ ...IDLE, status: 'loading', key: '' });

  useEffect(() => {
    if (sorted.length === 0) return;
    let cancelled = false;
    fetch('/api/compatibility/check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ items: sorted, locale }),
    })
      .then(async (res) => {
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const message =
            body !== null &&
            typeof body === 'object' &&
            typeof (body as { message?: unknown }).message === 'string'
              ? (body as { message: string }).message
              : `Request failed with status ${String(res.status)}`;
          throw new Error(message);
        }
        return parseCompatibilityResult(body);
      })
      .then((parsed) => {
        if (cancelled) return;
        const issues = sortCompatibilityIssues(parsed.issues);
        setEntry({
          key,
          status: 'ready',
          compatible: parsed.compatible,
          issues,
          hasErrors: compatibilityHasErrors(issues),
          error: null,
        });
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setEntry({
          key,
          status: 'error',
          compatible: true,
          issues: [],
          hasErrors: false,
          error: fetchError instanceof Error ? fetchError.message : 'Compatibility check failed',
        });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` resume ids+cantidades.
  }, [key, locale]);

  if (sorted.length === 0) return IDLE;
  if (entry.key !== key) {
    return { ...IDLE, status: 'loading' };
  }
  return entry;
}
