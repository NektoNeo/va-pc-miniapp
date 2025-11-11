import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";

/**
 * POST /api/admin/auth/login
 * Authenticate admin user and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Query admin user by email
    const user = await db.adminUser.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        role: true,
        active: true,
      },
    });

    // User not found or password invalid
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.active) {
      return NextResponse.json(
        { error: "Account has been deactivated" },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await db.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create JWT session
    const token = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set session cookie
    await setSessionCookie(token);

    // Return success with user data (exclude password hash)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
