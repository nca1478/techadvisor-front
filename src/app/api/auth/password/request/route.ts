import type { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

/** `POST /api/auth/password/request` — forwards the OTP request (always 200). */
export async function POST(request: Request): Promise<NextResponse> {
  return proxyToBackend(request, '/auth/password/request');
}
