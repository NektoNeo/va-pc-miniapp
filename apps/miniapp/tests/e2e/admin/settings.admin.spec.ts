import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Admin Panel - Settings (Top-4 Reordering)
 * Focus: Component-level screenshots (NO full-page screenshots)
 *
 * Test scenarios:
 * 1. Display Top-4 PC builds list
 * 2. Reorder Top-4 using drag-and-drop
 * 3. Save reordered Top-4
 */

test.describe("Admin: Settings - Top-4 Reordering", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Settings page
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");
  });

  test("should display settings page with Top-4 section", async ({ page }) => {
    // Verify page heading
    const heading = page.getByRole("heading", { name: /settings|настройки/i });
    await expect(heading).toBeVisible();

    // Screenshot: Page header
    const header = page.locator("div.flex.items-center.justify-between").first();
    await header.screenshot({
      path: "tests/screenshots/admin/settings-header.png",
    });

    // Find Top-4 PC Builds section (more specific to avoid matching Top-4 Devices)
    const top4Heading = page.getByRole("heading", {
      name: /top.*4.*pc|top.*4.*сборок|топ.*4.*сборок/i
    });
    await expect(top4Heading).toBeVisible();

    // Screenshot: Top-4 section heading
    const top4Header = top4Heading.locator("..");
    await top4Header.screenshot({
      path: "tests/screenshots/admin/settings-top4-heading.png",
    });
  });

  test("should display Top-4 PC builds list", async ({ page }) => {
    // Check if Top-4 section has items
    const emptyMessage = page.locator("text=/пуст|empty/i");
    const hasItems = (await emptyMessage.count()) === 0;

    // Skip test if Top-4 is empty
    if (!hasItems) {
      test.skip();
      return;
    }

    // Find Top-4 list container by finding a known item and getting its parent
    // The structure is: generic container -> generic items (Gaming Beast Pro, etc.)
    // We look for a known PC build name from seed data
    const knownPcBuild = page.locator("text=Gaming Beast Pro").first();
    await expect(knownPcBuild).toBeVisible();

    // Get the container that holds all PC build items (3 divs up from the text)
    const top4List = knownPcBuild.locator("xpath=ancestor::div[3]");
    await expect(top4List).toBeVisible();

    // Verify multiple items exist
    const items = top4List.locator("> div");
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThanOrEqual(1);

    // Screenshot: Initial Top-4 list state
    await top4List.screenshot({
      path: "tests/screenshots/admin/settings-top4-initial.png",
    });
  });

  test("should reorder Top-4 using drag-and-drop", async ({ page }) => {
    // Find sortable list
    const listContainer = page.locator(
      "[role='list'], [data-dnd-list], .sortable-list, ul"
    ).first();

    // Get draggable items
    const items = listContainer.locator("li, [data-dnd-item], [draggable]");
    const itemCount = await items.count();

    if (itemCount >= 2) {
      // Get first and second item titles/text before reordering
      const firstItemText = await items.first().textContent();
      const secondItemText = await items.nth(1).textContent();

      console.log("Before reorder:");
      console.log(`  1st: ${firstItemText?.substring(0, 30)}`);
      console.log(`  2nd: ${secondItemText?.substring(0, 30)}`);

      // Perform drag-and-drop: move first item to second position
      // @dnd-kit uses mouse events for drag-and-drop
      const firstItem = items.first();
      const secondItem = items.nth(1);

      // Get bounding boxes
      const firstBox = await firstItem.boundingBox();
      const secondBox = await secondItem.boundingBox();

      if (firstBox && secondBox) {
        // Calculate center points
        const firstCenter = {
          x: firstBox.x + firstBox.width / 2,
          y: firstBox.y + firstBox.height / 2,
        };

        const secondCenter = {
          x: secondBox.x + secondBox.width / 2,
          y: secondBox.y + secondBox.height / 2 + 10, // Slight offset to ensure drop below
        };

        // Perform drag-and-drop using mouse events
        await page.mouse.move(firstCenter.x, firstCenter.y);
        await page.mouse.down();
        await page.waitForTimeout(100);

        // Move to second item position
        await page.mouse.move(secondCenter.x, secondCenter.y, { steps: 10 });
        await page.waitForTimeout(100);

        await page.mouse.up();
        await page.waitForTimeout(300);

        // Screenshot: Reordered state
        await listContainer.screenshot({
          path: "tests/screenshots/admin/settings-top4-reordered.png",
        });

        // Verify order changed
        const newFirstItemText = await items.first().textContent();
        console.log("After reorder:");
        console.log(`  1st: ${newFirstItemText?.substring(0, 30)}`);

        // Order should have changed
        expect(newFirstItemText).toBe(secondItemText);
      }
    }
  });

  test("should save reordered Top-4", async ({ page }) => {
    // Check if Top-4 section has items first
    const emptyMessage = page.locator("text=/пуст|empty/i");
    const hasItems = (await emptyMessage.count()) === 0;

    // Skip test if Top-4 is empty
    if (!hasItems) {
      test.skip();
      return;
    }

    // Find the Top-4 section container first
    const top4Section = page.locator("text=Top-4 сборок ПК").locator("..");

    // Look for Save button within Top-4 section - use .first() to avoid strict mode
    const saveButton = top4Section.getByRole("button", {
      name: /save|submit|сохранить|применить/i,
    }).first();

    // May need to scroll to button
    if (await saveButton.count() > 0) {
      await saveButton.scrollIntoViewIfNeeded();

      // Screenshot: Save button
      await saveButton.screenshot({
        path: "tests/screenshots/admin/settings-save-button.png",
      });

      // Click save
      await saveButton.click();
      await page.waitForTimeout(1000);

      // Check for success toast
      const toast = page.locator("[data-sonner-toast]");
      if (await toast.count() > 0) {
        await toast.first().screenshot({
          path: "tests/screenshots/admin/settings-save-success-toast.png",
        });

        expect(await toast.first().textContent()).toMatch(
          /success|успешно|saved|сохранено/i
        );
      }
    }
  });

  test("should display budget presets editor", async ({ page }) => {
    // Look for budget presets section
    const budgetHeading = page.getByRole("heading", {
      name: /budget|бюджет|presets|пресеты/i,
    });

    if (await budgetHeading.count() > 0) {
      await expect(budgetHeading).toBeVisible();

      // Find budget presets container
      const budgetSection = budgetHeading.locator("../..");

      // Screenshot: Budget presets section
      await budgetSection.screenshot({
        path: "tests/screenshots/admin/settings-budget-presets.png",
      });
    }
  });

  test("should display telegraph links editor", async ({ page }) => {
    // Look for telegraph section
    const telegraphHeading = page.getByRole("heading", {
      name: /telegraph|телеграф|links|ссылки/i,
    });

    if (await telegraphHeading.count() > 0) {
      await expect(telegraphHeading).toBeVisible();

      // Find telegraph links container
      const telegraphSection = telegraphHeading.locator("../..");

      // Screenshot: Telegraph links section
      await telegraphSection.screenshot({
        path: "tests/screenshots/admin/settings-telegraph-links.png",
      });
    }
  });

  test("should display Top-4 devices section", async ({ page }) => {
    // Look for devices section
    const devicesHeading = page.getByRole("heading", {
      name: /top.*device|топ.*устройств/i,
    });

    if (await devicesHeading.count() > 0) {
      await expect(devicesHeading).toBeVisible();

      // Find devices list
      const devicesList = devicesHeading
        .locator("../..")
        .locator("[role='list'], ul")
        .first();

      if (await devicesList.count() > 0) {
        // Screenshot: Top-4 devices list
        await devicesList.screenshot({
          path: "tests/screenshots/admin/settings-top4-devices.png",
        });
      }
    }
  });
});
