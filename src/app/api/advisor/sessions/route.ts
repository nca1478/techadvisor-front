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

/**
 * `GET /api/advisor/sessions` — lists the caller's own sessions (newest
 * first). Authenticated users only (the backend enforces JWT and answers
 * 401 otherwise); anonymous guests keep their history locally in the browser
 * (see `chatSessionHistoryStorage` in `lib/api/advisor`). Cookies travel in
 * both directions through the same proxy.
 */
export async function GET(request: Request) {
  return proxyToBackend(request, '/advisor/sessions');
}
