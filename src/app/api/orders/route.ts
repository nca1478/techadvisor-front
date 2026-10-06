import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/** `GET /api/orders` — orders of the authenticated user. */
export async function GET(request: Request) {
  return proxyToBackend(request, '/orders');
}

/**
 * `POST /api/orders` — creates an order from the current cart. Totals are
 * frozen server-side from the database; the client only sends `{ shipping }`.
 */
export async function POST(request: Request) {
  return proxyToBackend(request, '/orders');
}
