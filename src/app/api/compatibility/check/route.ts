import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/**
 * `POST /api/compatibility/check` — veredicto determinista del motor de
 * reglas (sin LLM). Reenvía al backend sin transformar el cuerpo.
 */
export async function POST(request: Request) {
  return proxyToBackend(request, '/compatibility/check');
}
