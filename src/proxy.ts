import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const GUEST_ROUTES = ['/login', '/register', '/forgot-password'] as const;

const PUBLIC_ROUTES = ['/', '/bootstrap', '/403', '/verify-email', '/error-demo'] as const;

/**
 * Evaluates whether a request pathname matches a route or sub-route prefix.
 */
function isRouteMatch(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Edge Authentication Proxy Handler
 *
 * Architectural Note on Cookie Guard vs Cryptographic Auth:
 * Checking `request.cookies.has('rfpnexa_token')` acts as a fast, zero-latency edge filter
 * to prevent unauthenticated guests from accessing internal dashboard routes. Full token
 * verification, expiration checks, and session revocation are delegated downstream to the
 * client authentication provider (`/auth/me`) and backend API interceptors.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // 1. Guest routes (/login, /register, etc.): allow request to proceed so client can evaluate session
  if (isRouteMatch(pathname, GUEST_ROUTES)) {
    return NextResponse.next();
  }

  // 2. Fast edge cookie check (verifies presence of token cookie without network overhead)
  const hasAccessToken = request.cookies.has('rfpnexa_token');

  if (process.env.NODE_ENV === 'development') {
    console.log('proxy path:', pathname, 'hasAccessToken:', hasAccessToken);
  }

  // 3. Protected routes: redirect unauthenticated users to /login preserving full pathname + query params
  const isPublicRoute = isRouteMatch(pathname, PUBLIC_ROUTES);
  if (!hasAccessToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    const redirect = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', redirect);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - static assets (favicon.ico, sitemap.xml, robots.txt, manifests, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|site.webmanifest|sw.js).*)',
  ],
};
