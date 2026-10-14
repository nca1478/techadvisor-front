import type { Order } from '@/lib/api/orders';

/** localStorage key for the last order created before the Stripe redirect. */
export const LAST_ORDER_STORAGE_KEY = 'ta_last_order_id';

/**
 * Remembers the order id before leaving for hosted Stripe Checkout, so the
 * Stripe-facing return URLs (`/checkout/success`, which only carries
 * `session_id`) can route back to the localized status page. Guarded for SSR.
 */
export function storeLastOrderId(orderId: string): void {
  try {
    window.localStorage.setItem(LAST_ORDER_STORAGE_KEY, orderId);
  } catch {
    // Private mode / disabled storage: status pages still work via ?orderId=.
  }
}

export function readLastOrderId(): string | null {
  try {
    return window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export interface PollOptions {
  intervalMs?: number;
  maxAttempts?: number;
  isSettled?: (order: Order) => boolean;
  /**
   * Called after every fetch (including the first) so the UI can render the
   * order progressively instead of waiting for the poll to finish. Firing
   * the callback never changes the polling itself.
   */
  onOrder?: (order: Order, attempts: number) => void;
}

const DEFAULT_IS_SETTLED = (order: Order): boolean => order.status !== 'PENDING_PAYMENT';

/**
 * Polls `fetchOrder` until the order leaves `PENDING_PAYMENT` (the Stripe
 * webhook, not the redirect, is the source of truth) or attempts run out.
 * Bounded by construction: at most `maxAttempts` calls, `intervalMs` apart.
 */
export async function pollOrderUntilSettled(
  fetchOrder: () => Promise<Order>,
  options: PollOptions = {},
): Promise<{ order: Order; settled: boolean; attempts: number }> {
  const { intervalMs = 2500, maxAttempts = 24, isSettled = DEFAULT_IS_SETTLED } = options;
  const { onOrder } = options;
  let attempts = 0;
  let order = await fetchOrder();
  attempts += 1;
  onOrder?.(order, attempts);
  while (!isSettled(order) && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    order = await fetchOrder();
    attempts += 1;
    onOrder?.(order, attempts);
  }
  return { order, settled: isSettled(order), attempts };
}
