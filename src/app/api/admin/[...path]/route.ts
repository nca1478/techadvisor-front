import { proxyMultipartToBackend, proxyToBackend } from '@/lib/api/backend';

export const dynamic = 'force-dynamic';

interface AdminRouteContext {
  params: Promise<{ path: string[] }>;
}

/**
 * Same-origin BFF proxy for the back-office (`/admin/*`). Forwards method,
 * raw body and caller cookies (httpOnly `ta_access`/`ta_refresh` + `sid`) to
 * the backend, which enforces `ADMIN` role on every route — a CUSTOMER token
 * gets 403 there. The frontend never sees tokens; it only surfaces UX-level
 * redirects and error states.
 */
function backendPathOf(request: Request, path: string[]): string {
  const url = new URL(request.url);
  const base = `/admin/${path.map((segment) => encodeURIComponent(segment)).join('/')}`;
  return url.search ? `${base}${url.search}` : base;
}

async function proxyAdmin(request: Request, context: AdminRouteContext) {
  const { path } = await context.params;
  const backendPath = backendPathOf(request, path);
  // Multipart uploads (document files) carry binary bytes: `request.text()`
  // would corrupt them and the JSON forwarder would drop the boundary, so
  // they take the binary-preserving proxy instead.
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.startsWith('multipart/')) {
    return proxyMultipartToBackend(request, backendPath);
  }
  return proxyToBackend(request, backendPath);
}

export async function GET(request: Request, context: AdminRouteContext) {
  return proxyAdmin(request, context);
}

export async function POST(request: Request, context: AdminRouteContext) {
  return proxyAdmin(request, context);
}

export async function PATCH(request: Request, context: AdminRouteContext) {
  return proxyAdmin(request, context);
}

export async function PUT(request: Request, context: AdminRouteContext) {
  return proxyAdmin(request, context);
}

export async function DELETE(request: Request, context: AdminRouteContext) {
  return proxyAdmin(request, context);
}
