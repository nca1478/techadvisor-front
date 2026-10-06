import { type ApiClient, createApiClient } from './client';
import type { components } from './schema';

export type Order = components['schemas']['OrderResponseDto'];
export type OrderItem = components['schemas']['OrderItemDto'];
export type ShippingAddress = components['schemas']['ShippingAddressDto'];
export type CreateOrder = components['schemas']['CreateOrderDto'];

export type OrderStatus = Order['status'];

/** Order states that still wait for the Stripe webhook confirmation. */
export const PENDING_ORDER_STATUSES: readonly OrderStatus[] = ['PENDING_PAYMENT'] as const;

/** Terminal states reached only via backend transitions (webhook / admin). */
export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = [
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export function isOrderPending(status: OrderStatus): boolean {
  return (PENDING_ORDER_STATUSES as readonly string[]).includes(status);
}

/**
 * Orders against the generated OpenAPI contract. Creation and reads require
 * the caller's access token (the BFF injects it from httpOnly cookies).
 * Money (`totalAmount`, `unitPriceAmount`) is frozen server-side from the
 * database — the client only sends the shipping address.
 */
export function createOrdersApi(client: ApiClient = createApiClient()) {
  return {
    createOrder: (body: CreateOrder, init?: RequestInit) =>
      client.post<Order>('/orders', body, init),
    listOrders: (init?: RequestInit) => client.get<Order[]>('/orders', init),
    getOrder: (id: string, init?: RequestInit) =>
      client.get<Order>(`/orders/${encodeURIComponent(id)}`, init),
  };
}

export type OrdersApi = ReturnType<typeof createOrdersApi>;
