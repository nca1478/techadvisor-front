import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/**
 * `POST /api/advisor/sessions` — opens a chat session for the caller
 * (authenticated user or anonymous guest via the `sid` cookie). The backend
 * sets/refreshes `sid` itself; `proxyToBackend` forwards cookies both ways.
 */
export async function POST(request: Request) {
  return proxyToBackend(request, '/advisor/sessions');
}
