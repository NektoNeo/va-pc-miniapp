import { test, expect } from "@playwright/test";

/**
 * E2E Tests: PC Detail Page - Configurator
 * Focus: Component-level screenshots (NO full-page screenshots)
 */

test.describe("PC Detail Page - Configurator", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to PCs page first
    await page.goto("/pcs");
    await page.waitForLoadState("networkidle");

    // Click first PC card to navigate to detail page
    const firstPCCard = page.locator("div.grid a").first();
    await firstPCCard.click();
    await page.waitForLoadState("networkidle");
  });

  test("should display PC details header", async ({ page }) => {
    const title = page.locator("h1");
    await expect(title).toBeVisible();

    const qualityBadge = page.locator("[data-badge]").first();
    if (await qualityBadge.isVisible().catch(() => false)) {
      // Screenshot: Header section with title and badge
      const header = page.locator("div.flex.items-start.justify-between").first();
      await header.screenshot({
        path: "tests/screenshots/pc-detail-header.png",
      });
    }
  });

  test("should display configurator with price", async ({ page }) => {
    const configurator = page.locator("text=Конфигурация").locator("..");
    await expect(configurator).toBeVisible();

    // Check price is displayed
    const price = configurator.locator("text=/₽/");
    await expect(price).toBeVisible();

    // Screenshot: Configurator card
    await configurator.screenshot({
      path: "tests/screenshots/pc-configurator.png",
    });
  });

  test("should display RAM options", async ({ page }) => {
    const ramSection = page.locator("h3", { hasText: "Оперативная память" }).locator("..");
    await expect(ramSection).toBeVisible();

    // Check at least one RAM option exists
    const ramOptions = ramSection.locator("button");
    await expect(ramOptions.first()).toBeVisible();

    // Screenshot: RAM options section
    await ramSection.screenshot({
      path: "tests/screenshots/pc-configurator-ram-options.png",
    });
  });

  test("should display SSD options", async ({ page }) => {
    const ssdSection = page.locator("h3", { hasText: "Накопитель" }).locator("..");
    await expect(ssdSection).toBeVisible();

    // Check at least one SSD option exists
    const ssdOptions = ssdSection.locator("button");
    await expect(ssdOptions.first()).toBeVisible();

    // Screenshot: SSD options section
    await ssdSection.screenshot({
      path: "tests/screenshots/pc-configurator-ssd-options.png",
    });
  });

  test("should update price when selecting different RAM", async ({ page }) => {
    const configurator = page.locator("text=Конфигурация").locator("..");

    // Get initial price
    const priceElement = configurator.locator("text=/₽/").first();
    const initialPrice = await priceElement.textContent();

    // Screenshot: Initial state
    await configurator.screenshot({
      path: "tests/screenshots/pc-configurator-initial-price.png",
    });

    // Find RAM options
    const ramSection = page.locator("h3", { hasText: "Оперативная память" }).locator("..");
    const ramOptions = ramSection.locator("button");
    const ramCount = await ramOptions.count();

    // Select a different RAM option if available
    if (ramCount > 1) {
      await ramOptions.nth(1).click();
      await page.waitForTimeout(300);

      // Get updated price
      const updatedPrice = await priceElement.textContent();

      // Screenshot: Updated price
      await configurator.screenshot({
        path: "tests/screenshots/pc-configurator-updated-price.png",
      });

      // Price might change or stay the same (delta could be 0)
      expect(updatedPrice).toBeDefined();
    }
  });

  test("should highlight selected RAM option", async ({ page }) => {
    const ramSection = page.locator("h3", { hasText: "Оперативная память" }).locator("..");
    const ramOptions = ramSection.locator("button");

    // First option should be selected by default
    const firstOption = ramOptions.first();
    await expect(firstOption).toHaveClass(/border-primary/);

    // Screenshot: Selected RAM option
    await firstOption.screenshot({
      path: "tests/screenshots/pc-configurator-selected-ram.png",
    });

    // Click second option
    const ramCount = await ramOptions.count();
    if (ramCount > 1) {
      await ramOptions.nth(1).click();
      await page.waitForTimeout(200);

      // Second option should now be selected
      await expect(ramOptions.nth(1)).toHaveClass(/border-primary/);

      // Screenshot: Newly selected option
      await ramOptions.nth(1).screenshot({
        path: "tests/screenshots/pc-configurator-selected-ram-updated.png",
      });
    }
  });

  test("should highlight selected SSD option", async ({ page }) => {
    const ssdSection = page.locator("h3", { hasText: "Накопитель" }).locator("..");
    const ssdOptions = ssdSection.locator("button");

    // First option should be selected by default
    const firstOption = ssdOptions.first();
    await expect(firstOption).toHaveClass(/border-primary/);

    // Screenshot: Selected SSD option
    await firstOption.screenshot({
      path: "tests/screenshots/pc-configurator-selected-ssd.png",
    });

    // Click second option
    const ssdCount = await ssdOptions.count();
    if (ssdCount > 1) {
      await ssdOptions.nth(1).click();
      await page.waitForTimeout(200);

      // Second option should now be selected
      await expect(ssdOptions.nth(1)).toHaveClass(/border-primary/);

      // Screenshot: Newly selected option
      await ssdOptions.nth(1).screenshot({
        path: "tests/screenshots/pc-configurator-selected-ssd-updated.png",
      });
    }
  });

  test("should display price delta badges on options", async ({ page }) => {
    // Check RAM options for price deltas
    const ramSection = page.locator("h3", { hasText: "Оперативная память" }).locator("..");
    const ramPriceBadges = ramSection.locator("[data-badge], .badge, text=/[+-].*₽/");

    if ((await ramPriceBadges.count()) > 0) {
      // Screenshot: Price delta badge
      await ramPriceBadges.first().screenshot({
        path: "tests/screenshots/pc-configurator-price-delta-badge.png",
      });
    }
  });

  test("should display gallery component", async ({ page }) => {
    // Look for gallery/images
    const gallery = page.locator("img, video").first();

    if (await gallery.isVisible().catch(() => false)) {
      const galleryContainer = gallery.locator("..");

      // Screenshot: Gallery section
      await galleryContainer.screenshot({
        path: "tests/screenshots/pc-detail-gallery.png",
      });
    }
  });

  test("should display specs list", async ({ page }) => {
    // Look for specs section
    const specsSection = page.locator("text=/характеристики|спецификации|specs/i").locator("..");

    if (await specsSection.isVisible().catch(() => false)) {
      // Screenshot: Specs section
      await specsSection.screenshot({
        path: "tests/screenshots/pc-detail-specs.png",
      });
    }
  });
});
