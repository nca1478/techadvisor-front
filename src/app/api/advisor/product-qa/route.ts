import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/** `POST /api/advisor/product-qa` — RAG product Q&A (cited, with abstention). */
export async function POST(request: Request) {
  return proxyToBackend(request, '/advisor/product-qa');
}
