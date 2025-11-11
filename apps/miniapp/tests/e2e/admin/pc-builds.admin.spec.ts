import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Admin Panel - PC Builds CRUD
 * Focus: Component-level screenshots (NO full-page screenshots)
 *
 * Test scenarios:
 * 1. Create new PC build
 * 2. View PC builds table
 * 3. Edit existing PC build
 */

test.describe("Admin: PC Builds", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to PC Builds admin page
    await page.goto("/admin/pcs");
    await page.waitForLoadState("networkidle");
  });

  test("should display PC builds table", async ({ page }) => {
    // Verify page header
    const heading = page.getByRole("heading", { name: /PC Builds|Сборки ПК/i });
    await expect(heading).toBeVisible();

    // Screenshot: Page header with "Create" button
    const header = page.locator("div.flex.items-center.justify-between").first();
    await header.screenshot({
      path: "tests/screenshots/admin/pc-builds-header.png",
    });

    // Verify table exists with data
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Verify at least one row exists (from seed data)
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    // Screenshot: Table with data
    const tableContainer = page.locator("table").first();
    await tableContainer.screenshot({
      path: "tests/screenshots/admin/pc-builds-table.png",
    });
  });

  test("should open create PC build form", async ({ page }) => {
    // Click "Create" or "Создать" link
    const createLink = page.getByRole("link", { name: /create|создать/i });
    await createLink.click();

    // Wait for navigation to new page
    await page.waitForURL(/\/admin\/pcs\/new/);
    await page.waitForLoadState("networkidle");

    // Verify form heading
    const heading = page.getByRole("heading", { name: /создание|создать|create|new/i });
    await expect(heading).toBeVisible();

    // Screenshot: Empty form state
    const form = page.locator("form").first();
    await form.screenshot({
      path: "tests/screenshots/admin/pc-build-form-empty.png",
    });
  });

  test("should fill and submit PC build form", async ({ page }) => {
    // Navigate to create page
    await page.goto("/admin/pcs/new");
    await page.waitForLoadState("networkidle");

    // Switch to "Основное" tab first (where slug, title, price fields are)
    await page.getByRole("tab", { name: /основное|basic|general/i }).click();
    await page.waitForTimeout(500); // Wait for tab content to load

    // Fill required fields
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);

    // Slug (with random suffix to avoid collisions in parallel execution)
    await page.getByLabel(/slug/i).fill(`test-pc-${timestamp}-${randomSuffix}`);

    // Title
    await page.getByLabel(/title|название/i).fill(`Test PC ${timestamp}`);

    // Subtitle (if exists)
    const subtitleField = page.getByLabel(/subtitle|подзаголовок/i);
    if (await subtitleField.count() > 0) {
      await subtitleField.fill("Test subtitle for E2E");
    }

    // Price - use spinbutton role since it's not a regular input
    const priceField = page.getByRole("spinbutton").first();
    await priceField.fill("150000");

    // Screenshot: Filled basic fields
    const form = page.locator("form").first();
    await form.screenshot({
      path: "tests/screenshots/admin/pc-build-form-filled-basic.png",
    });

    // Switch to Specifications tab
    await page.getByRole("tab", { name: /характеристики|specifications/i }).click();
    await page.waitForTimeout(500); // Wait for tab content to load

    // Fill spec fields (CPU, GPU, RAM, SSD) and blur each for React Hook Form validation
    await page.getByLabel(/cpu|процессор/i).fill("AMD Ryzen 7 7800X3D");
    await page.evaluate(() => document.activeElement?.blur());
    await page.getByLabel(/gpu|видеокарта/i).fill("NVIDIA RTX 4070 Ti");
    await page.evaluate(() => document.activeElement?.blur());
    await page.getByLabel(/ram|память/i).fill("32GB DDR5");
    await page.evaluate(() => document.activeElement?.blur());
    await page.getByLabel(/ssd|накопитель/i).fill("1TB NVMe");
    await page.evaluate(() => document.activeElement?.blur());
    await page.getByLabel(/psu|блок питания/i).fill("750W 80+ Gold");
    await page.evaluate(() => document.activeElement?.blur());
    await page.getByLabel(/case|корпус/i).fill("NZXT H7 Flow");
    await page.evaluate(() => document.activeElement?.blur());
    await page.getByLabel(/cooling|охлаждение/i).fill("AIO 280mm");
    await page.evaluate(() => document.activeElement?.blur());

    // Screenshot: Filled spec fields
    await form.screenshot({
      path: "tests/screenshots/admin/pc-build-form-filled-spec.png",
    });

    // Select availability (if dropdown exists)
    const availabilitySelect = page.getByLabel(/availability|доступность/i);
    if (await availabilitySelect.count() > 0) {
      await availabilitySelect.click();
      await page.getByRole("option", { name: /in stock|в наличии/i }).click();
    }

    // Toggle isTop switch (if exists)
    const isTopSwitch = page.getByLabel(/top|топ/i);
    if (await isTopSwitch.count() > 0) {
      await isTopSwitch.check();
    }

    // Screenshot: Form ready to submit
    await form.screenshot({
      path: "tests/screenshots/admin/pc-build-form-ready.png",
    });

    // Submit form (while on "Характеристики" tab to keep spec fields mounted)
    const submitButton = page.getByRole("button", {
      name: /save|create|сохранить|создать/i,
    });

    // Check if button is enabled before clicking
    await expect(submitButton).toBeEnabled();

    // Wait for API response after submit
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/admin/pcs") &&
        response.request().method() === "POST",
      { timeout: 5000 }
    );

    // Click submit button
    await submitButton.click();

    // Wait for API response
    const response = await responsePromise;
    const responseStatus = response.status();
    const responseBody = await response.json().catch(() => ({}));

    console.log("[E2E Test] API Response status:", responseStatus);
    console.log("[E2E Test] API Response body:", JSON.stringify(responseBody, null, 2));

    // Wait for redirect or success message
    await page.waitForTimeout(1000);

    // Check for success toast or redirect
    const toast = page.locator("[data-sonner-toast]");
    if (await toast.count() > 0) {
      // Screenshot: Success toast
      await toast.first().screenshot({
        path: "tests/screenshots/admin/pc-build-form-success-toast.png",
      });

      expect(await toast.first().textContent()).toContain("успешно");
    }

    // Should redirect to list page
    await expect(page).toHaveURL(/\/admin\/pcs$/);
  });

  test("should display edit form with existing data", async ({ page }) => {
    // Navigate to table
    await page.goto("/admin/pcs");
    await page.waitForLoadState("networkidle");

    // Check if there are any rows in the table
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    // Skip test if no data exists
    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Click edit button on first row
    const firstEditButton = rows
      .first()
      .getByRole("button", { name: /edit|редактировать/i });

    await firstEditButton.click();

    // Wait for navigation
    await page.waitForURL(/\/admin\/pcs\/\w+/);
    await page.waitForLoadState("networkidle");

    // Verify form has pre-filled data
    const titleField = page.getByLabel(/title|название/i);
    await expect(titleField).not.toHaveValue("");

    // Screenshot: Edit form with existing data
    const form = page.locator("form").first();
    await form.screenshot({
      path: "tests/screenshots/admin/pc-build-form-edit.png",
    });
  });

  test("should filter PC builds in table", async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/search|поиск/i);

    if (await searchInput.count() > 0) {
      // Type search query
      await searchInput.fill("gaming");
      await page.waitForTimeout(300);

      // Screenshot: Filtered table
      const tableContainer = page.locator("table").first();
      await tableContainer.screenshot({
        path: "tests/screenshots/admin/pc-builds-table-filtered.png",
      });
    }
  });
});
