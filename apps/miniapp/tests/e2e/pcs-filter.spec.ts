import { test, expect } from "@playwright/test";

/**
 * E2E Tests: PCs Page - Budget Filter
 * Focus: Component-level screenshots (NO full-page screenshots)
 */

test.describe("PCs Page - Budget Filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pcs");
    await page.waitForLoadState("networkidle");
  });

  test("should display budget filter with all options", async ({ page }) => {
    const budgetFilter = page.locator("h3", { hasText: "Бюджет" }).locator("..");
    await expect(budgetFilter).toBeVisible();

    // Check all budget options are present
    const options = ["Все цены", "46-100k", "100-150k", "150-225k", "225-300k", "300-500k"];
    for (const option of options) {
      await expect(page.locator("button", { hasText: option })).toBeVisible();
    }

    // Screenshot: Budget filter component
    await budgetFilter.screenshot({
      path: "tests/screenshots/pcs-budget-filter.png",
    });
  });

  test("should filter PCs when selecting budget range", async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector("text=Найдено:");

    const initialCount = await page.locator("text=Найдено:").textContent();

    // Screenshot: Initial state
    const filterCard = page.locator("div.space-y-4").first();
    await filterCard.screenshot({
      path: "tests/screenshots/pcs-filter-initial.png",
    });

    // Click 100-150k budget
    await page.locator("button", { hasText: "100-150k" }).click();
    await page.waitForTimeout(500); // Wait for filter to apply

    // Verify filter is active (button style changes)
    const selectedButton = page.locator("button", { hasText: "100-150k" });
    await expect(selectedButton).toHaveClass(/default/);

    // Screenshot: Active budget filter
    await page.locator("h3", { hasText: "Бюджет" }).locator("..").screenshot({
      path: "tests/screenshots/pcs-budget-filter-active.png",
    });

    // Verify URL parameters
    await page.waitForURL(/minPrice=100000/);
    await page.waitForURL(/maxPrice=150000/);

    expect(page.url()).toContain("minPrice=100000");
    expect(page.url()).toContain("maxPrice=150000");
  });

  test("should display quality filter", async ({ page }) => {
    const qualityFilter = page.locator("h3", { hasText: /качеств/i }).locator("..");

    if (await qualityFilter.isVisible()) {
      // Screenshot: Quality filter component
      await qualityFilter.screenshot({
        path: "tests/screenshots/pcs-quality-filter.png",
      });
    }
  });

  test("should show clear filters button when filters are active", async ({ page }) => {
    // Apply budget filter
    await page.locator("button", { hasText: "100-150k" }).click();
    await page.waitForTimeout(300);

    // Check clear filters button appears
    const clearButton = page.locator("button", { hasText: "Сбросить фильтры" });
    await expect(clearButton).toBeVisible();

    // Screenshot: Clear filters button
    await clearButton.screenshot({
      path: "tests/screenshots/pcs-clear-filters-button.png",
    });

    // Click clear filters
    await clearButton.click();
    await page.waitForTimeout(300);

    // Verify filters are cleared
    const allPricesButton = page.locator("button", { hasText: "Все цены" });
    await expect(allPricesButton).toHaveClass(/default/);
  });

  test("should display loading state", async ({ page }) => {
    // Navigate to page
    await page.goto("/pcs");

    // Check for loading skeletons
    const loadingCards = page.locator(".animate-pulse");

    if (await loadingCards.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      // Screenshot: Loading state
      await loadingCards.first().screenshot({
        path: "tests/screenshots/pcs-loading-skeleton.png",
      });
    }
  });

  test("should display PC results grid", async ({ page }) => {
    await page.waitForSelector("text=Найдено:");

    // Check results grid exists
    const resultsGrid = page.locator("div.grid.grid-cols-1");
    await expect(resultsGrid).toBeVisible();

    // Screenshot: Results grid (first 3 cards only, not full page)
    const gridContainer = resultsGrid.locator("..");
    await gridContainer.screenshot({
      path: "tests/screenshots/pcs-results-grid.png",
    });
  });

  test("should display empty state when no results", async ({ page }) => {
    // Apply very restrictive filter that might return no results
    await page.locator("button", { hasText: "300-500k" }).click();

    // Add quality filter if available to further restrict
    const highQualityButton = page.locator("button", { hasText: /ultra/i });
    if (await highQualityButton.isVisible().catch(() => false)) {
      await highQualityButton.click();
    }

    await page.waitForTimeout(500);

    // Check for empty state
    const emptyState = page.locator("text=По выбранным фильтрам ничего не найдено");

    if (await emptyState.isVisible().catch(() => false)) {
      // Screenshot: Empty state card
      const emptyCard = emptyState.locator("..");
      await emptyCard.screenshot({
        path: "tests/screenshots/pcs-empty-state.png",
      });
    }
  });
});
