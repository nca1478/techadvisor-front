import { describe, expect, it } from 'vitest';
import { pollOrderUntilSettled } from './order-polling';
import { shippingSchema } from './shipping-schema';
import type { Order } from '@/lib/api/orders';

function orderWith(status: Order['status']): Order {
  return {
    id: 'order-1',
    status,
    currency: 'USD',
    totalAmount: 1000,
    itemCount: 1,
    shipping: { fullName: 'Ada', line1: 'Calle 1', city: 'Madrid', country: 'ES' },
    items: [],
    statusHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('shippingSchema', () => {
  it('accepts a complete international address', () => {
    const parsed = shippingSchema.safeParse({
      fullName: 'Ada Lovelace',
      line1: 'Calle Mayor 1, 2º B',
      line2: '',
      city: 'Madrid',
      region: 'Madrid',
      postalCode: '28001',
      country: 'es',
      phone: '+34 600 123 456',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.country).toBe('ES');
      expect(parsed.data.line2).toBeUndefined();
    }
  });

  it('rejects missing names and non-alpha-2 countries', () => {
    const parsed = shippingSchema.safeParse({
      fullName: '',
      line1: 'Calle 1',
      city: 'Madrid',
      country: 'ESP',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('pollOrderUntilSettled', () => {
  it('returns settled as soon as the webhook marks the order paid', async () => {
    const states = [orderWith('PENDING_PAYMENT'), orderWith('PENDING_PAYMENT'), orderWith('PAID')];
    const result = await pollOrderUntilSettled(
      () => Promise.resolve(states.shift() ?? orderWith('PAID')),
      { intervalMs: 1, maxAttempts: 10 },
    );
    expect(result.settled).toBe(true);
    expect(result.order.status).toBe('PAID');
    expect(result.attempts).toBe(3);
  });

  it('stops after maxAttempts while still pending', async () => {
    const result = await pollOrderUntilSettled(
      () => Promise.resolve(orderWith('PENDING_PAYMENT')),
      {
        intervalMs: 1,
        maxAttempts: 3,
      },
    );
    expect(result.settled).toBe(false);
    expect(result.attempts).toBe(3);
  });

  it('reports every fetched order via onOrder for progressive rendering', async () => {
    const states = [orderWith('PENDING_PAYMENT'), orderWith('PENDING_PAYMENT'), orderWith('PAID')];
    const seen: { status: Order['status']; attempts: number }[] = [];
    const result = await pollOrderUntilSettled(
      () => Promise.resolve(states.shift() ?? orderWith('PAID')),
      {
        intervalMs: 1,
        maxAttempts: 10,
        onOrder: (order, attempts) => {
          seen.push({ status: order.status, attempts });
        },
      },
    );
    expect(result.settled).toBe(true);
    expect(seen).toEqual([
      { status: 'PENDING_PAYMENT', attempts: 1 },
      { status: 'PENDING_PAYMENT', attempts: 2 },
      { status: 'PAID', attempts: 3 },
    ]);
  });
});
