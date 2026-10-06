import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * `GET /api/orders/:id` — single order of the authenticated user. The
 * success page polls this endpoint: only the Stripe webhook (never the
 * redirect) moves the order out of `PENDING_PAYMENT`.
 */
export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/orders/${encodeURIComponent(id)}`);
}
