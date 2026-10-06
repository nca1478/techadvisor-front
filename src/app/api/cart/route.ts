import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/**
 * `GET /api/cart` — current cart. Guest identity travels in the
 * backend-issued httpOnly `sid` cookie, forwarded transparently by the BFF
 * (same-origin, so no cross-site cookie issues between :3000 and :3001).
 */
export async function GET(request: Request) {
  return proxyToBackend(request, '/cart');
}
