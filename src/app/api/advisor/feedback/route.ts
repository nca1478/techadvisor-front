import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/**
 * `POST /api/advisor/feedback` — stub. Forwards to the backend
 * `POST /advisor/feedback` (append-only `AdvisorFeedback` rows); the widget
 * treats any failure as non-blocking.
 */
export async function POST(request: Request) {
  return proxyToBackend(request, '/advisor/feedback');
}
