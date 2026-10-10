import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/** `POST /api/advisor/support` — post-sale support advisor (policies, cited, with abstention). */
export async function POST(request: Request) {
  return proxyToBackend(request, '/advisor/support');
}
