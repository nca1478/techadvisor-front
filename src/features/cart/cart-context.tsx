'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Cart } from '@/lib/api/cart';

export type CartStatus = 'loading' | 'ready' | 'error' | 'mutating';

export interface CartContextValue {
  status: CartStatus;
  cart: Cart | null;
  error: string | null;
  reload: () => Promise<void>;
  addItem: (
    productId: string,
    qty?: number,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  updateQty: (
    productId: string,
    qty: number,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  removeItem: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function errorMessage(status: number, body: unknown): string {
  if (body !== null && typeof body === 'object') {
    const message = (body as Record<string, unknown>)['message'];
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return `Request failed with status ${String(status)}`;
}

/**
 * Client cart provider. The cart persists server-side (guest `sid` cookie or
 * user cart); this context only mirrors the latest server response, whose
 * `totalAmount` / `lineTotalAmount` are the single source of truth for money.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CartStatus>('loading');
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus((prev) => (prev === 'loading' ? prev : 'mutating'));
    try {
      const res = await fetch('/api/cart', { credentials: 'same-origin' });
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(errorMessage(res.status, body));
        setStatus('error');
        return;
      }
      setCart(body as Cart);
      setError(null);
      setStatus('ready');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Network request failed');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cart', { credentials: 'same-origin' })
      .then(async (res): Promise<unknown> => {
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(errorMessage(res.status, body));
        }
        return body;
      })
      .then((body) => {
        if (cancelled) return;
        setCart(body as Cart);
        setError(null);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setError(error instanceof Error ? error.message : 'Network request failed');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = useCallback(async (request: () => Promise<Response>) => {
    setStatus('mutating');
    try {
      const res = await request();
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        return { ok: false as const, message: errorMessage(res.status, body) };
      }
      setCart(body as Cart);
      setError(null);
      setStatus('ready');
      return { ok: true as const };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Network request failed';
      return { ok: false as const, message };
    }
  }, []);

  const addItem = useCallback(
    (productId: string, qty = 1) =>
      mutate(() =>
        fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ productId, qty }),
        }),
      ),
    [mutate],
  );

  const updateQty = useCallback(
    (productId: string, qty: number) =>
      mutate(() =>
        fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ qty }),
        }),
      ),
    [mutate],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      await mutate(() =>
        fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
          method: 'DELETE',
          credentials: 'same-origin',
        }),
      );
    },
    [mutate],
  );

  const value = useMemo<CartContextValue>(
    () => ({ status, cart, error, reload, addItem, updateQty, removeItem }),
    [status, cart, error, reload, addItem, updateQty, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
