import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AdminRole } from "@prisma/client";

// Session payload structure
export interface SessionPayload {
  userId: string;
  email: string;
  role: AdminRole;
  iat: number; // Issued at
  exp: number; // Expiration
}

// Session cookie name
export const SESSION_COOKIE = "admin-session";

// Session duration (1 hour)
const SESSION_DURATION = 60 * 60; // seconds

// Get JWT secret
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Create a new JWT session token
 */
export async function createSession(payload: {
  userId: string;
  email: string;
  role: AdminRole;
}): Promise<string> {
  const secret = getJwtSecret();
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_DURATION;

  const token = await new SignJWT({ ...payload, iat, exp })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);

  return token;
}

/**
 * Verify JWT token and return payload
 */
export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Get current session from cookies (Server Component)
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySession(sessionCookie.value);
}

/**
 * Set session cookie (Server Action / API Route)
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

/**
 * Clear session cookie (logout)
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Generate CSRF token (simple implementation)
 * In production, this should be more sophisticated
 */
export function generateCsrfToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}
