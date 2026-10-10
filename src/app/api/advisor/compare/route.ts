import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/** `POST /api/advisor/compare` — comparador de 2-3 productos (tabla SQL + resumen citado). */
export async function POST(request: Request) {
  return proxyToBackend(request, '/advisor/compare');
}
