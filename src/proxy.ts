import { NextResponse, type NextRequest } from 'next/server';

// Locale list kept inline (// mantener en sync con backend): the proxy runs
// detached from app modules, so it must not import shared code. Supported
// locales mirror `GET /config/public` (`supportedLocales`); the default is
// the backend `defaultLocale`.
const LOCALES = ['en', 'es'] as const;
const DEFAULT_LOCALE = 'en';

const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join('|')})(/|$)`);

function hasLocale(pathname: string): boolean {
  return LOCALE_PREFIX.test(pathname);
}

/**
 * Prefixes locale-less navigations with the default locale (`/` -> `/en`,
 * `/productos` -> `/en/productos`). Requests that already carry a locale,
 * API/static assets and the design-system review page pass through. The
 * resolved locale travels as `x-locale` so the root layout can set
 * `<html lang>`.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/design-system') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  if (hasLocale(pathname)) {
    const locale = pathname.split('/')[1] ?? DEFAULT_LOCALE;
    const response = NextResponse.next();
    response.headers.set('x-locale', locale);
    return response;
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  const redirect = NextResponse.redirect(url);
  redirect.headers.set('x-locale', DEFAULT_LOCALE);
  return redirect;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
