import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

/**
 * POST /api/admin/auth/logout
 * Clear session cookie and log out admin user
 */
export async function POST() {
  try {
    // Clear session cookie
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
