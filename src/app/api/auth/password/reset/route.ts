import type { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/** `POST /api/auth/password/reset` — forwards the final password change. */
export async function POST(request: Request): Promise<NextResponse> {
  return proxyToBackend(request, '/auth/password/reset');
}
