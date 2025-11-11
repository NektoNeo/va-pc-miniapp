import { test as setup, expect } from "@playwright/test";

/**
 * Auth Setup for Admin E2E Tests
 *
 * This setup file runs once before all admin tests to:
 * 1. Authenticate via /api/admin/auth/login (user must exist from seed)
 * 2. Save authentication state to .auth/admin.json
 *
 * All admin tests use this saved state for authentication.
 *
 * IMPORTANT: Run `pnpm db:seed` before tests to create the admin user:
 * - Email: test@va-pc.ru
 * - Password: TestPassword123!
 */

const adminAuthFile = ".auth/admin.json";

// Test admin credentials (must match credentials in prisma/seed.ts)
const TEST_ADMIN = {
  email: "test@va-pc.ru",
  password: "TestPassword123!",
};

setup("authenticate as admin", async ({ request }) => {
  console.log("🔑 Authenticating admin user via API...");
  console.log(
    "⚠️  Make sure you ran 'pnpm db:seed' to create the test admin user!"
  );

  // Authenticate via login API
  const response = await request.post("/api/admin/auth/login", {
    data: {
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
    },
  });

  // Check response
  if (!response.ok()) {
    const errorBody = await response.text();
    console.error("❌ Login failed:", errorBody);
    throw new Error(
      `Login failed with status ${response.status()}. Did you run 'pnpm db:seed'?`
    );
  }

  const data = await response.json();
  expect(data.success).toBe(true);
  expect(data.user).toBeDefined();
  expect(data.user.email).toBe(TEST_ADMIN.email);

  console.log(`✅ Authenticated as: ${data.user.email}`);

  // Save authentication state for other tests
  await request.storageState({ path: adminAuthFile });
  console.log(`💾 Saved auth state to ${adminAuthFile}`);
});
