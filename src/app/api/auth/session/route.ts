import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

/**
 * `GET /api/auth/session` — current browser session for client components.
 * Reads the httpOnly cookies server-side; the browser only ever sees
 * `{ authenticated, user }`, never the tokens.
 */
export async function GET(): Promise<NextResponse> {
  const session = await getSessionUser();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session.user }, { status: 200 });
}
