import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Public routes that don't require authentication
const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

// Session cookie name
const SESSION_COOKIE = "admin-session";

// Get JWT secret from environment
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return new TextEncoder().encode(secret);
}

// Verify JWT token
async function verifySession(token: string): Promise<boolean> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // BYPASS AUTH IN DEVELOPMENT MODE
  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware] DEV MODE: Bypassing auth for", pathname);
    return NextResponse.next();
  }

  // Allow public admin routes
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  // No session found - redirect to login
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify session
  const isValid = await verifySession(sessionCookie.value);

  if (!isValid) {
    // Invalid session - clear cookie and redirect to login
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // CSRF protection for state-changing requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const csrfToken = request.headers.get("x-csrf-token");

    // For now, just check that header exists
    // In production, verify token matches session
    if (!csrfToken) {
      return NextResponse.json(
        { error: "CSRF token missing" },
        { status: 403 }
      );
    }
  }

  // Valid session - allow request
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all admin routes except:
     * - API routes (handled separately)
     * - Static files
     * - _next internals
     */
    "/admin/:path*",
  ],
};
