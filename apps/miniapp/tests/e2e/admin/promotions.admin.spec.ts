import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Admin Panel - Promotions CRUD
 * Focus: Component-level screenshots (NO full-page screenshots)
 *
 * Test scenarios:
 * 1. Create new promotion
 * 2. View promotions table
 * 3. Preview affected items
 */

test.describe("Admin: Promotions", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Promotions admin page
    await page.goto("/admin/promos");
    await page.waitForLoadState("networkidle");
  });

  test("should display promotions table", async ({ page }) => {
    // Verify page heading
    const heading = page.getByRole("heading", { name: /Промо|акци/i });
    await expect(heading).toBeVisible();

    // Screenshot: Header with create button
    const header = page.locator("div.flex.items-center.justify-between").first();
    await header.screenshot({
      path: "tests/screenshots/admin/promotions-header.png",
    });

    // Verify table exists
    const table = page.locator("table");
    if (await table.count() > 0) {
      // Screenshot: Promotions table
      await table.first().screenshot({
        path: "tests/screenshots/admin/promotions-table.png",
      });
    }
  });

  test("should open create promotion form", async ({ page }) => {
    // Click create link
    const createLink = page.getByRole("link", { name: /create|создать/i });
    await createLink.click();

    // Wait for navigation
    await page.waitForURL(/\/admin\/promos\/new/);
    await page.waitForLoadState("networkidle");

    // Verify form heading
    const heading = page.getByRole("heading", {
      name: /новая|создать|create|new/i,
    });
    await expect(heading).toBeVisible();

    // Screenshot: Empty promotion form
    const form = page.locator("form").first();
    await form.screenshot({
      path: "tests/screenshots/admin/promotion-form-empty.png",
    });
  });

  test("should fill and submit promotion form", async ({ page }) => {
    // Navigate to create page
    await page.goto("/admin/promos/new");
    await page.waitForLoadState("networkidle");

    const timestamp = Date.now();

    // Fill basic fields
    await page.getByLabel(/slug/i).fill(`test-promo-${timestamp}`);
    await page.getByLabel(/title|название/i).fill(`Test Promo ${timestamp}`);

    const descriptionField = page.getByLabel(/description|описание/i);
    if (await descriptionField.count() > 0) {
      await descriptionField.fill("Test promotion for E2E testing");
    }

    // Screenshot: Basic fields filled
    const form = page.locator("form").first();
    await form.screenshot({
      path: "tests/screenshots/admin/promotion-form-filled-basic.png",
    });

    // Toggle active switch
    const activeSwitch = page.getByLabel(/active|активн/i);
    if (await activeSwitch.count() > 0) {
      await activeSwitch.check();
    }

    // Set dates (if date pickers exist)
    const startsAtField = page.getByLabel(/starts|начало|дата начала/i);
    if (await startsAtField.count() > 0) {
      // Future date: tomorrow at 00:00 (datetime-local format: YYYY-MM-DDTHH:MM)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
      await startsAtField.fill(dateStr);
    }

    const endsAtField = page.getByLabel(/ends|окончание|дата окончания/i);
    if (await endsAtField.count() > 0) {
      // Future date: next week at 23:59 (datetime-local format: YYYY-MM-DDTHH:MM)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const dateStr = nextWeek.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
      await endsAtField.fill(dateStr);
    }

    // Fill discount value
    const valueField = page.getByLabel(/value|значение|процент|скидка/i);
    if (await valueField.count() > 0) {
      await valueField.fill("15");
    }

    // Set min/max price rules
    const minPriceField = page.getByLabel(/min.*price|минимальная цена/i);
    if (await minPriceField.count() > 0) {
      await minPriceField.fill("50000");
    }

    const maxPriceField = page.getByLabel(/max.*price|максимальная цена/i);
    if (await maxPriceField.count() > 0) {
      await maxPriceField.fill("500000");
    }

    // Screenshot: Form with rules filled
    await form.screenshot({
      path: "tests/screenshots/admin/promotion-form-filled-rules.png",
    });

    // Check for preview section
    const previewSection = page.locator("text=/preview|предпросмотр/i");
    if (await previewSection.count() > 0) {
      // Screenshot: Affected items preview
      const previewContainer = previewSection.locator("..").first();
      await previewContainer.screenshot({
        path: "tests/screenshots/admin/promotion-preview-affected.png",
      });
    }

    // Submit form
    const submitButton = page.getByRole("button", {
      name: /save|create|сохранить|создать/i,
    });
    await submitButton.click();

    // Wait for response
    await page.waitForTimeout(1000);

    // Check for success toast
    const toast = page.locator("[data-sonner-toast]");
    if (await toast.count() > 0) {
      await toast.first().screenshot({
        path: "tests/screenshots/admin/promotion-form-success-toast.png",
      });
    }

    // Should redirect to list
    await expect(page).toHaveURL(/\/admin\/promos$/);
  });

  test("should display promotion card in table", async ({ page }) => {
    // Navigate to table
    await page.goto("/admin/promos");
    await page.waitForLoadState("networkidle");

    // Look for promotion cards or rows
    const promoCards = page.locator("[data-promo-card], tbody tr");

    if ((await promoCards.count()) > 0) {
      // Screenshot: Single promotion card/row
      await promoCards.first().screenshot({
        path: "tests/screenshots/admin/promotion-card.png",
      });
    }
  });

  test("should toggle promotion active status", async ({ page }) => {
    // Navigate to table
    await page.goto("/admin/promos");
    await page.waitForLoadState("networkidle");

    // Find active toggle switch
    const toggleSwitch = page
      .locator("tbody tr")
      .first()
      .getByRole("switch");

    if (await toggleSwitch.count() > 0) {
      const wasChecked = await toggleSwitch.isChecked();

      // Toggle the switch
      await toggleSwitch.click();
      await page.waitForTimeout(500);

      // Verify state changed
      const nowChecked = await toggleSwitch.isChecked();
      expect(nowChecked).not.toBe(wasChecked);

      // Screenshot: Toggled state
      const row = toggleSwitch.locator("../../../..");
      await row.screenshot({
        path: "tests/screenshots/admin/promotion-toggled.png",
      });
    }
  });
});
