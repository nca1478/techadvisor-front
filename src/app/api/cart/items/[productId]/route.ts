import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ productId: string }>;
}

/** `PATCH /api/cart/items/:productId` — sets the line quantity. */
export async function PATCH(request: Request, context: RouteContext) {
  const { productId } = await context.params;
  return proxyToBackend(request, `/cart/items/${encodeURIComponent(productId)}`);
}

/** `DELETE /api/cart/items/:productId` — removes the line (idempotent). */
export async function DELETE(request: Request, context: RouteContext) {
  const { productId } = await context.params;
  return proxyToBackend(request, `/cart/items/${encodeURIComponent(productId)}`);
}
