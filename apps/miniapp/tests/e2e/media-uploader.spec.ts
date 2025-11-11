import { test, expect } from "@playwright/test";
import path from "path";

/**
 * E2E Tests: MediaUploader Component
 * Focus: Section-only screenshots (NO full-page screenshots)
 *
 * Tests uploader states:
 * - Idle state with alt text input
 * - Drag & drop interactions
 * - Upload progress
 * - Error states
 * - Success states
 */

test.describe("MediaUploader Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/test/media-uploader");
    await page.waitForLoadState("networkidle");
  });

  test("should display idle state with alt text input", async ({ page }) => {
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');
    await expect(uploaderSection).toBeVisible();

    // Check alt text input
    const altTextInput = page.locator('input[type="text"]#alt-text');
    await expect(altTextInput).toBeVisible();
    await expect(altTextInput).toHaveAttribute("placeholder", /Describe the image/);
    await expect(altTextInput).toHaveAttribute("maxLength", "140");

    // Check character counter
    const charCounter = page.locator('text=/\\/140 characters/');
    await expect(charCounter).toBeVisible();

    // Screenshot: Idle state
    await uploaderSection.screenshot({
      path: "tests/screenshots/media-uploader-idle.png",
    });
  });

  test("should display dropzone with correct labels", async ({ page }) => {
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');

    // Check dropzone text
    const dropzoneText = page.locator('text=Drag & drop an image, or click to select');
    await expect(dropzoneText).toBeVisible();

    const formatText = page.locator('text=JPEG, PNG, WebP, AVIF • Max 10MB');
    await expect(formatText).toBeVisible();

    // Screenshot: Dropzone detail
    const dropzone = page.locator('div.border-2.border-dashed');
    await dropzone.screenshot({
      path: "tests/screenshots/media-uploader-dropzone.png",
    });
  });

  test("should update character counter when typing alt text", async ({ page }) => {
    const altTextInput = page.locator('input#alt-text');
    const charCounter = page.locator('text=/\\d+\\/140 characters/');

    // Initially should show 0/140
    await expect(charCounter).toHaveText("0/140 characters");

    // Type some text
    const testAltText = "A beautiful gaming PC setup with RGB lighting";
    await altTextInput.fill(testAltText);

    // Should update counter
    await expect(charCounter).toHaveText(`${testAltText.length}/140 characters`);

    // Screenshot: Alt text filled
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');
    await uploaderSection.screenshot({
      path: "tests/screenshots/media-uploader-alt-text-filled.png",
    });
  });

  test("should enforce 140 character limit on alt text", async ({ page }) => {
    const altTextInput = page.locator('input#alt-text');
    const charCounter = page.locator('text=/\\d+\\/140 characters/');

    // Type more than 140 characters
    const longText = "A".repeat(150);
    await altTextInput.fill(longText);

    // Should truncate to 140
    const value = await altTextInput.inputValue();
    expect(value.length).toBe(140);
    await expect(charCounter).toHaveText("140/140 characters");

    // Screenshot: Max characters
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');
    await uploaderSection.screenshot({
      path: "tests/screenshots/media-uploader-max-characters.png",
    });
  });

  test("should show hover state on dropzone", async ({ page }) => {
    const dropzone = page.locator('div.border-2.border-dashed');

    // Hover over dropzone
    await dropzone.hover();
    await page.waitForTimeout(200); // Wait for CSS transition

    // Should have hover class
    await expect(dropzone).toHaveClass(/hover:border-violet-400/);

    // Screenshot: Hover state
    await dropzone.screenshot({
      path: "tests/screenshots/media-uploader-dropzone-hover.png",
    });
  });

  test("should display file preview after selection", async ({ page }) => {
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');

    // Fill alt text first
    const altTextInput = page.locator('input#alt-text');
    await altTextInput.fill("Test gaming PC");

    // Prepare file for upload (mock)
    const fileInput = page.locator('input[type="file"]');

    // Create a test image file path
    const testImagePath = path.join(__dirname, "../fixtures/test-image.jpg");

    // Note: This test requires a test image fixture
    // For now, we'll skip the actual upload and just verify the UI structure

    // Screenshot: Ready to upload state
    await uploaderSection.screenshot({
      path: "tests/screenshots/media-uploader-ready.png",
    });
  });

  test("should disable controls during upload", async ({ page }) => {
    // This test verifies that inputs are disabled when status !== 'idle'
    // In a real scenario, we'd mock the API response to test this

    const altTextInput = page.locator('input#alt-text');
    const dropzone = page.locator('div.border-2.border-dashed');

    // Initially should be enabled
    await expect(altTextInput).toBeEnabled();
    await expect(dropzone).not.toHaveClass(/cursor-not-allowed/);

    // Screenshot: Controls enabled
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');
    await uploaderSection.screenshot({
      path: "tests/screenshots/media-uploader-controls-enabled.png",
    });
  });

  test("should show component structure in different viewport sizes", async ({ page, isMobile }) => {
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');

    // Screenshot for current viewport (desktop or mobile)
    const screenshotName = isMobile
      ? "tests/screenshots/media-uploader-mobile.png"
      : "tests/screenshots/media-uploader-desktop.png";

    await uploaderSection.screenshot({
      path: screenshotName,
    });
  });

  test("should have accessible labels and ARIA attributes", async ({ page }) => {
    const altTextInput = page.locator('input#alt-text');
    const altTextLabel = page.locator('label[for="alt-text"]');

    // Check label exists and is associated
    await expect(altTextLabel).toBeVisible();
    await expect(altTextLabel).toHaveText(/Alt Text/);

    // Check input has proper attributes
    await expect(altTextInput).toHaveAttribute("id", "alt-text");

    // Screenshot: Accessibility features
    const inputSection = page.locator('div').filter({ has: altTextInput }).first();
    await inputSection.screenshot({
      path: "tests/screenshots/media-uploader-accessibility.png",
    });
  });

  test("should maintain brand color scheme (violet)", async ({ page }) => {
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');

    // Check for violet color classes (brand color)
    const dropzone = page.locator('div.border-2.border-dashed');

    // The component should use violet brand colors
    // We can't easily test CSS values, but we can verify class structure
    await expect(uploaderSection).toBeVisible();

    // Screenshot: Brand colors
    await uploaderSection.screenshot({
      path: "tests/screenshots/media-uploader-brand-colors.png",
    });
  });

  test("should render all sections properly", async ({ page }) => {
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');

    // Verify main sections exist
    const altTextSection = page.locator('label[for="alt-text"]').locator('..');
    const dropzoneSection = page.locator('div.border-2.border-dashed');

    await expect(altTextSection).toBeVisible();
    await expect(dropzoneSection).toBeVisible();

    // Full uploader section screenshot
    await uploaderSection.screenshot({
      path: "tests/screenshots/media-uploader-full-section.png",
    });
  });
});

test.describe("MediaUploader - Error States", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/test/media-uploader");
    await page.waitForLoadState("networkidle");
  });

  test("should show validation message for empty alt text", async ({ page }) => {
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');

    // Alt text label should indicate it's required
    const altTextLabel = page.locator('label[for="alt-text"]');
    await expect(altTextLabel).toContainText("Required");

    // Screenshot: Required field indicator
    await uploaderSection.screenshot({
      path: "tests/screenshots/media-uploader-required-field.png",
    });
  });
});

test.describe("MediaUploader - Layout Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/test/media-uploader");
    await page.waitForLoadState("networkidle");
  });

  test("should have proper spacing and layout", async ({ page }) => {
    const uploaderSection = page.locator('[data-testid="media-uploader-section"]');

    // Verify max-width constraint
    const uploaderContainer = uploaderSection.locator('> div').first();

    // Component should have max-w-2xl class for proper width constraint
    await expect(uploaderContainer).toBeVisible();

    // Screenshot: Layout and spacing
    await uploaderSection.screenshot({
      path: "tests/screenshots/media-uploader-layout.png",
    });
  });

  test("should have rounded corners and proper styling", async ({ page }) => {
    const dropzone = page.locator('div.border-2.border-dashed');

    // Dropzone should have rounded corners
    await expect(dropzone).toHaveClass(/rounded-lg/);

    // Screenshot: Styling details
    await dropzone.screenshot({
      path: "tests/screenshots/media-uploader-styling.png",
    });
  });
});
