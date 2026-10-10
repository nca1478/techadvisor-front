import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * `GET /api/advisor/sessions/:id` — owned session with message history.
 * Lets the chat page restore the conversation after a reload (guest via
 * `sid` cookie, authenticated via Bearer; both forwarded by the proxy).
 */
export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/advisor/sessions/${encodeURIComponent(id)}`);
}

/**
 * `DELETE /api/advisor/sessions/:id` — permanently deletes the owned session
 * with its messages (backend `204`). Ownership is re-checked server-side;
 * unknown or foreign ids 404 exactly like reads.
 */
export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToBackend(request, `/advisor/sessions/${encodeURIComponent(id)}`);
}
