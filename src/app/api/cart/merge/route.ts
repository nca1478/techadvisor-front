import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/**
 * `POST /api/cart/merge` — merges the guest cart into the user cart after
 * login. The backend clears the `sid` cookie; the `Set-Cookie` is forwarded
 * so the browser drops it too.
 */
export async function POST(request: Request) {
  return proxyToBackend(request, '/cart/merge');
}
