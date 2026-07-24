import { NextRequest, NextResponse } from "next/server";

const GUEST_ROUTES = ["/login", "/register", "/forgot-password"] as const;

const PUBLIC_ROUTES = [
  "/",
  "/bootstrap",
  "/403",
  "/verify-email",
  "/error-demo",
] as const;

function matches(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Guest routes (/login, /register, etc.): allow request to proceed so client /auth/me can evaluate session
  if (matches(pathname, GUEST_ROUTES)) {
    return NextResponse.next();
  }

  const hasAccessToken =
    request.cookies.has("nexusbid_token") ||
    request.cookies.has("__Host-access_token");

  console.log("middleware path:", pathname, "hasAccessToken:", hasAccessToken);

  // 2. Protected routes: redirect unauthenticated users to /login
  const isPublicRoute = matches(pathname, PUBLIC_ROUTES);
  if (!hasAccessToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
