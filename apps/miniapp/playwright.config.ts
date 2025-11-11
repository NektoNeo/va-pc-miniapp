import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E testing
 * Focus: Component/section screenshots ONLY (no full-page screenshots)
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
    screenshot: "off", // глобально отключаем фулл-скрины
  },

  projects: [
    // Setup project for admin authentication
    {
      name: "admin-auth-setup",
      testMatch: /.*auth\.setup\.ts/,
    },

    // Desktop tests (public pages)
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /.*\.admin\.spec\.ts/,
    },

    // Mobile tests (public pages)
    {
      name: "mobile",
      use: { ...devices["iPhone 13 Pro"] },
      testIgnore: /.*\.admin\.spec\.ts/,
    },

    // Admin tests (require authentication)
    {
      name: "admin-chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/admin.json",
      },
      dependencies: ["admin-auth-setup"],
      testMatch: /.*\.admin\.spec\.ts/,
    },
  ],

  webServer: {
    command: "NEXT_DEV_OVERLAY=false pnpm dev",
    url: "http://localhost:3002",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
