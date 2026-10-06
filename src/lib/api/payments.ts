import { type ApiClient, createApiClient } from './client';
import type { components } from './schema';

export type Checkout = components['schemas']['CheckoutResponseDto'];
export type CreateCheckout = components['schemas']['CreateCheckoutDto'];

/**
 * Payments against the generated OpenAPI contract. The frontend uses hosted
 * Stripe Checkout only: the backend returns a `checkoutUrl` and the browser
 * performs a full redirect there. No card data ever touches this app, and no
 * Stripe.js publishable key is needed (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
 * is intentionally unset — see ADR 0007).
 */
export function createPaymentsApi(client: ApiClient = createApiClient()) {
  return {
    createCheckout: (body: CreateCheckout, init?: RequestInit) =>
      client.post<Checkout>('/payments/checkout', body, init),
  };
}

export type PaymentsApi = ReturnType<typeof createPaymentsApi>;
