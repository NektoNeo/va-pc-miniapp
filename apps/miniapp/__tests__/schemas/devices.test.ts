import { describe, it, expect } from "vitest";
import {
  deviceFormSchema,
  generateDeviceSlug,
  formatPrice,
} from "@/lib/validations/devices";

describe("Devices Validation", () => {
  describe("deviceFormSchema", () => {
    const validCategoryId = "cm5abc123def456gh"; // valid CUID

    it("should validate valid device data", () => {
      const validData = {
        slug: "hyperx-alloy-fps-pro",
        categoryId: validCategoryId,
        title: "HyperX Alloy FPS Pro",
        price: 5990,
        badges: ["New", "Popular"],
        isTop: false,
      };

      const result = deviceFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept optional coverImageId", () => {
      const validData = {
        slug: "logitech-g502",
        categoryId: validCategoryId,
        title: "Logitech G502",
        price: 4990,
        coverImageId: "cm5xyz789abc012de",
        badges: [],
        isTop: false,
      };

      const result = deviceFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should apply default empty badges array", () => {
      const dataWithoutBadges = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 1000,
      };

      const result = deviceFormSchema.safeParse(dataWithoutBadges);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.badges).toEqual([]);
      }
    });

    it("should apply default false for isTop", () => {
      const dataWithoutIsTop = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 1000,
      };

      const result = deviceFormSchema.safeParse(dataWithoutIsTop);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isTop).toBe(false);
      }
    });

    it("should reject empty slug", () => {
      const invalidData = {
        slug: "",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 1000,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject slug longer than 60 characters", () => {
      const invalidData = {
        slug: "a".repeat(61),
        categoryId: validCategoryId,
        title: "Test Device",
        price: 1000,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject slug with invalid characters", () => {
      const invalidData = {
        slug: "test_device!",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 1000,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid categoryId format", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: "invalid-cuid",
        title: "Test Device",
        price: 1000,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty title", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "",
        price: 1000,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject title longer than 100 characters", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "a".repeat(101),
        price: 1000,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject price below minimum (100₽)", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 99,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Минимальная цена");
      }
    });

    it("should reject price above maximum (9,999,999₽)", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 10000000,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative price", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: -1000,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject zero price", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 0,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer price", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 1000.50,
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("целым числом");
      }
    });

    it("should accept price at minimum boundary (100₽)", () => {
      const validData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 100,
      };

      const result = deviceFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept price at maximum boundary (9,999,999₽)", () => {
      const validData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 9999999,
      };

      const result = deviceFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject badge longer than 20 characters", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 1000,
        badges: ["a".repeat(21)],
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty badge strings", () => {
      const invalidData = {
        slug: "test-device",
        categoryId: validCategoryId,
        title: "Test Device",
        price: 1000,
        badges: [""],
      };

      const result = deviceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("generateDeviceSlug helper", () => {
    it("should generate slug from English title", () => {
      const result = generateDeviceSlug("HyperX Alloy FPS Pro");
      expect(result).toBe("hyperx-alloy-fps-pro");
    });

    it("should generate slug from Russian title", () => {
      const result = generateDeviceSlug("Клавиатура HyperX");
      expect(result).toBe("klaviatura-hyperx");
    });

    it("should transliterate Russian characters", () => {
      const result = generateDeviceSlug("Мышь Logitech");
      expect(result).toBe("mysh-logitech");
    });

    it("should handle special Russian letters", () => {
      const result = generateDeviceSlug("Ёжик");
      expect(result).toBe("yozhik");
    });

    it("should remove special characters", () => {
      const result = generateDeviceSlug("Mouse @ G502!");
      expect(result).toBe("mouse-g502");
    });

    it("should replace multiple spaces with single dash", () => {
      const result = generateDeviceSlug("Gaming   Keyboard");
      expect(result).toBe("gaming-keyboard");
    });

    it("should trim whitespace", () => {
      const result = generateDeviceSlug("  Gaming Mouse  ");
      expect(result).toBe("gaming-mouse");
    });

    it("should limit length to 60 characters", () => {
      const longTitle = "a".repeat(100);
      const result = generateDeviceSlug(longTitle);
      expect(result.length).toBeLessThanOrEqual(60);
    });

    it("should convert to lowercase", () => {
      const result = generateDeviceSlug("GAMING KEYBOARD");
      expect(result).toBe("gaming-keyboard");
    });

    it("should remove leading and trailing dashes", () => {
      const result = generateDeviceSlug("-Test Device-");
      expect(result).toBe("test-device");
    });

    it("should handle empty string", () => {
      const result = generateDeviceSlug("");
      expect(result).toBe("");
    });
  });

  describe("formatPrice helper", () => {
    it("should format price with Russian locale", () => {
      const result = formatPrice(150000);
      expect(result).toBe(`${(150000).toLocaleString("ru-RU")}₽`);
    });

    it("should format small price", () => {
      const result = formatPrice(1000);
      expect(result).toBe(`${(1000).toLocaleString("ru-RU")}₽`);
    });

    it("should format price below 1000 without space", () => {
      const result = formatPrice(999);
      expect(result).toBe(`${(999).toLocaleString("ru-RU")}₽`);
    });

    it("should format large price", () => {
      const result = formatPrice(9999999);
      expect(result).toBe(`${(9999999).toLocaleString("ru-RU")}₽`);
    });

    it("should format zero", () => {
      const result = formatPrice(0);
      expect(result).toBe(`${(0).toLocaleString("ru-RU")}₽`);
    });
  });
});
