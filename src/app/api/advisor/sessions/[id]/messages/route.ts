import { proxyStreamToBackend, proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * `POST /api/advisor/sessions/:id/messages` — buying-advisor turn
 * (`{ content, locale?, currency? }`, no `role`). Forwards the caller's
 * `Accept` header: `text/event-stream` pipes the backend SSE replay
 * (deltas → products → done) untouched; anything else returns the buffered
 * JSON recommendation. Cookies (`sid`, auth) travel in both directions.
 */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const backendPath = `/advisor/sessions/${encodeURIComponent(id)}/messages`;
  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('text/event-stream')) {
    return proxyStreamToBackend(request, backendPath);
  }
  return proxyToBackend(request, backendPath);
}
