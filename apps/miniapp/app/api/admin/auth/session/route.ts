import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, clearSessionCookie } from "@/lib/auth/session";

/**
 * GET /api/admin/auth/session
 * Verify current session and return user data
 */
export async function GET() {
  try {
    // Get session from cookie
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verify user still exists and is active
    const user = await db.adminUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });

    // User not found or deactivated - clear session
    if (!user || !user.active) {
      await clearSessionCookie();
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Return authenticated user data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
