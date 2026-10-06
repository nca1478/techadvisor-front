import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/**
 * `POST /api/payments/checkout` — starts a hosted Stripe Checkout Session
 * for a `PENDING_PAYMENT` order. Returns `{ provider, sessionId, checkoutUrl }`
 * and the browser redirects to `checkoutUrl`. No card data is handled here.
 */
export async function POST(request: Request) {
  return proxyToBackend(request, '/payments/checkout');
}
