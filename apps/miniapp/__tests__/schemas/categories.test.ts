import { describe, it, expect } from "vitest";
import {
  categoryFormSchema,
  generateCategorySlug,
} from "@/lib/validations/categories";

describe("Categories Validation", () => {
  describe("categoryFormSchema", () => {
    it("should validate valid category data", () => {
      const validData = {
        slug: "gaming-pcs",
        kind: "PC" as const,
        title: "Игровые ПК",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate category with parent", () => {
      const validData = {
        slug: "budget-gaming",
        kind: "PC" as const,
        title: "Бюджетные игровые",
        parentId: "cm5abc123def456gh", // valid CUID
      };

      const result = categoryFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept DEVICE kind", () => {
      const validData = {
        slug: "keyboards",
        kind: "DEVICE" as const,
        title: "Клавиатуры",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty slug", () => {
      const invalidData = {
        slug: "",
        kind: "PC" as const,
        title: "Test Category",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject slug longer than 60 characters", () => {
      const invalidData = {
        slug: "a".repeat(61),
        kind: "PC" as const,
        title: "Test Category",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject slug with uppercase letters", () => {
      const invalidData = {
        slug: "Gaming-PCs",
        kind: "PC" as const,
        title: "Gaming PCs",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("строчные латинские");
      }
    });

    it("should reject slug with spaces", () => {
      const invalidData = {
        slug: "gaming pcs",
        kind: "PC" as const,
        title: "Gaming PCs",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject slug with special characters", () => {
      const invalidData = {
        slug: "gaming_pcs!",
        kind: "PC" as const,
        title: "Gaming PCs",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept slug with numbers and dashes", () => {
      const validData = {
        slug: "gaming-pcs-2024",
        kind: "PC" as const,
        title: "Gaming PCs 2024",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const invalidData = {
        slug: "gaming-pcs",
        kind: "PC" as const,
        title: "",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject title longer than 100 characters", () => {
      const invalidData = {
        slug: "test",
        kind: "PC" as const,
        title: "a".repeat(101),
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing kind", () => {
      const invalidData = {
        slug: "test",
        title: "Test",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid kind value", () => {
      const invalidData = {
        slug: "test",
        kind: "INVALID" as any,
        title: "Test",
        parentId: null,
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid parentId format", () => {
      const invalidData = {
        slug: "test",
        kind: "PC" as const,
        title: "Test",
        parentId: "invalid-id-format",
      };

      const result = categoryFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Некорректный ID");
      }
    });
  });

  describe("generateCategorySlug helper", () => {
    it("should generate slug from English title", () => {
      const result = generateCategorySlug("Gaming PCs");
      expect(result).toBe("gaming-pcs");
    });

    it("should generate slug from Russian title", () => {
      const result = generateCategorySlug("Игровые ПК");
      expect(result).toBe("igrovye-pk");
    });

    it("should handle mixed Russian and English", () => {
      const result = generateCategorySlug("Gaming Компьютеры");
      expect(result).toBe("gaming-kompyutery");
    });

    it("should transliterate special Russian characters", () => {
      const result = generateCategorySlug("Ёлка");
      expect(result).toBe("yolka");
    });

    it("should remove special characters", () => {
      const result = generateCategorySlug("Gaming @ PCs!");
      expect(result).toBe("gaming-pcs");
    });

    it("should replace multiple spaces with single dash", () => {
      const result = generateCategorySlug("Gaming   PCs");
      expect(result).toBe("gaming-pcs");
    });

    it("should remove leading and trailing dashes", () => {
      const result = generateCategorySlug("-Gaming PCs-");
      expect(result).toBe("gaming-pcs");
    });

    it("should limit length to 60 characters", () => {
      const longTitle = "a".repeat(100);
      const result = generateCategorySlug(longTitle);
      expect(result.length).toBeLessThanOrEqual(60);
    });

    it("should handle empty string", () => {
      const result = generateCategorySlug("");
      expect(result).toBe("");
    });

    it("should handle string with only special characters", () => {
      const result = generateCategorySlug("@#$%");
      expect(result).toBe("");
    });

    it("should convert to lowercase", () => {
      const result = generateCategorySlug("GAMING PCS");
      expect(result).toBe("gaming-pcs");
    });

    it("should handle Cyrillic ё specifically", () => {
      const result = generateCategorySlug("Новогодняя ёлка");
      expect(result).toBe("novogodnyaya-yolka");
    });

    it("should handle all Cyrillic letters", () => {
      const cyrillic = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
      const result = generateCategorySlug(cyrillic);
      expect(result).toMatch(/^[a-z0-9-]+$/);
    });

    it("should trim whitespace", () => {
      const result = generateCategorySlug("  Gaming PCs  ");
      expect(result).toBe("gaming-pcs");
    });

    it("should replace multiple consecutive dashes with one", () => {
      const result = generateCategorySlug("Gaming---PCs");
      expect(result).toBe("gaming-pcs");
    });
  });
});
