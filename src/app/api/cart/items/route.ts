import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/** `POST /api/cart/items` — adds a product (`{ productId, qty }`). */
export async function POST(request: Request) {
  return proxyToBackend(request, '/cart/items');
}
