import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_EXACT_ROUTES = new Set([
  "/",
  "/login",
  "/signup",
  "/signin",
  "/register",
  "/features",
  "/pricing",
  "/developers",
  "/security",
  "/privacy",
  "/terms",
  "/cookies",
  "/status",
  "/contact",
  "/docs",
  "/solutions",
  "/401",
  "/403",
]);

const PUBLIC_PREFIXES = [
  "/api/",
  "/_next",
  "/brand",
  "/blog",
  "/p/",
  "/s/",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_EXACT_ROUTES.has(pathname)) return true;
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET must be configured in production environment.");
    }
    return new TextEncoder().encode("nxtqr_dev_secret_fallback_key_2026_secure_key_at_least_32_bytes");
  }
  return new TextEncoder().encode(secret);
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Ignore static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // e.g. .ico, .svg, .png, .css, .js
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("nxtqr_session")?.value;
  let sessionPayload: any = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, getSecretKey(), {
        algorithms: ["HS256"],
      });
      sessionPayload = payload;
    } catch {
      // Invalid or expired token
      sessionPayload = null;
    }
  }

  const isAuthenticated = Boolean(sessionPayload?.user);
  const user = sessionPayload?.user;

  // 1. Authenticated user visiting /login or /signup
  if (pathname === "/login" || pathname === "/signup" || pathname === "/signin" || pathname === "/register") {
    if (isAuthenticated) {
      if (!user.onboardingCompleted && (!user.workspaces || user.workspaces.length === 0)) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      const targetWorkspace = user.workspaces?.[0]?.slug || "workspace";
      return NextResponse.redirect(new URL(`/${targetWorkspace}`, request.url));
    }
    return NextResponse.next();
  }

  // 2. Public route passthrough
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 3. Protected route access check (/onboarding, /[orgSlug], etc.)
  if (!isAuthenticated) {
    const returnTo = `${pathname}${request.nextUrl.search}`;
    const loginUrl = new URL("/login", request.url);

    // Sanitize returnTo to prevent open redirects
    if (returnTo.startsWith("/") && !returnTo.startsWith("//") && !returnTo.includes("\\")) {
      loginUrl.searchParams.set("returnTo", returnTo);
    }

    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // 4. Multi-tenant workspace validation for /[orgSlug] routes
  if (user && user.workspaces && user.workspaces.length > 0 && pathname !== "/onboarding") {
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    if (firstSegment && !firstSegment.startsWith("api") && !isPublicRoute(`/${firstSegment}`)) {
      const hasOrg = user.workspaces.some(
        (w: any) => w.slug === firstSegment || w.id === firstSegment
      );
      if (!hasOrg) {
        // Redirect to the user's authoritative primary workspace
        const fallbackSlug = user.workspaces[0].slug;
        const restOfPath = pathname.split("/").filter(Boolean).slice(1).join("/");
        const destination = restOfPath ? `/${fallbackSlug}/${restOfPath}` : `/${fallbackSlug}`;
        return applySecurityHeaders(NextResponse.redirect(new URL(destination, request.url)));
      }
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes handled by route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
