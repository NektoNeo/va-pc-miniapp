import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Home Page - Category Tiles
 * Focus: Component-level screenshots (NO full-page screenshots)
 */

test.describe("Home Page - Category Tiles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display header", async ({ page }) => {
    const header = page.locator("h1", { hasText: "VA-PC" });
    await expect(header).toBeVisible();

    const subtitle = page.locator("text=Игровые компьютеры и периферия");
    await expect(subtitle).toBeVisible();

    // Screenshot: Header section only
    await header.locator("..").screenshot({
      path: "tests/screenshots/home-header.png",
    });
  });

  test("should display category tiles", async ({ page }) => {
    const tilesContainer = page.locator("div.grid.grid-cols-2");
    await expect(tilesContainer).toBeVisible();

    // Check Gaming PCs tile
    const gamingPCTile = page.locator("a[href='/pcs']");
    await expect(gamingPCTile).toBeVisible();
    await expect(gamingPCTile.locator("text=Игровые ПК")).toBeVisible();
    await expect(gamingPCTile.locator("text=Готовые сборки")).toBeVisible();

    // Check Devices tile
    const devicesTile = page.locator("a[href='/devices']");
    await expect(devicesTile).toBeVisible();
    await expect(devicesTile.locator("text=Девайсы")).toBeVisible();
    await expect(
      devicesTile.locator("text=Периферия и аксессуары")
    ).toBeVisible();

    // Screenshot: Category tiles section only
    await tilesContainer.screenshot({
      path: "tests/screenshots/home-category-tiles.png",
    });
  });

  test("should navigate to /pcs when clicking Gaming PC tile", async ({
    page,
  }) => {
    const gamingPCTile = page.locator("a[href='/pcs']");

    // Screenshot: Tile before click
    await gamingPCTile.screenshot({
      path: "tests/screenshots/home-gaming-pc-tile-before-click.png",
    });

    await gamingPCTile.click();
    await page.waitForURL("/pcs");

    expect(page.url()).toContain("/pcs");
  });

  test("should navigate to /devices when clicking Devices tile", async ({
    page,
  }) => {
    const devicesTile = page.locator("a[href='/devices']");

    // Screenshot: Tile before click
    await devicesTile.screenshot({
      path: "tests/screenshots/home-devices-tile-before-click.png",
    });

    await devicesTile.click();
    await page.waitForURL("/devices");

    expect(page.url()).toContain("/devices");
  });

  test("should apply hover effect on tiles", async ({ page }) => {
    const gamingPCTile = page.locator("a[href='/pcs']");

    // Hover and screenshot
    await gamingPCTile.hover();
    await page.waitForTimeout(200); // Wait for transition

    await gamingPCTile.screenshot({
      path: "tests/screenshots/home-tile-hover-state.png",
    });
  });
});
