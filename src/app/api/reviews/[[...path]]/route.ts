import { proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

interface ReviewsRouteContext {
  params: Promise<{ path?: string[] }>;
}

/**
 * Same-origin BFF proxy for customer reviews (`/reviews/*`). Forwards
 * method, raw body, query string and caller cookies (httpOnly
 * `ta_access`/`ta_refresh`) to the backend: creation requires the buyer
 * auth cookies, while public reads ride the same path so the browser never
 * needs the backend URL. The backend owns authz (verified buyers only) and
 * moderation states.
 */
function backendPathOf(request: Request, path: string[] | undefined): string {
  const url = new URL(request.url);
  const segments = path ?? [];
  const base =
    segments.length === 0
      ? '/reviews'
      : `/reviews/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;
  return url.search ? `${base}${url.search}` : base;
}

async function proxyReviews(request: Request, context: ReviewsRouteContext) {
  const { path } = await context.params;
  return proxyToBackend(request, backendPathOf(request, path));
}

export async function GET(request: Request, context: ReviewsRouteContext) {
  return proxyReviews(request, context);
}

export async function POST(request: Request, context: ReviewsRouteContext) {
  return proxyReviews(request, context);
}
