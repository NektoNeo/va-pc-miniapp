import { describe, it, expect } from "vitest";
import {
  mediaUploadSchema,
  imageFormatEnum,
  validateUploadedFile,
  getImageFormatLabel,
  mimeToImageFormat,
  ALLOWED_IMAGE_MIMES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/validations/media";

describe("Media Validation", () => {
  describe("mediaUploadSchema", () => {
    it("should validate valid upload data", () => {
      const validData = {
        alt: "Product image",
        format: "WEBP" as const,
      };

      const result = mediaUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should apply default format WEBP", () => {
      const dataWithoutFormat = {
        alt: "Product image",
      };

      const result = mediaUploadSchema.safeParse(dataWithoutFormat);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe("WEBP");
      }
    });

    it("should accept AVIF format", () => {
      const validData = {
        alt: "Product image",
        format: "AVIF" as const,
      };

      const result = mediaUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept JPEG format", () => {
      const validData = {
        alt: "Product image",
        format: "JPEG" as const,
      };

      const result = mediaUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept PNG format", () => {
      const validData = {
        alt: "Product image",
        format: "PNG" as const,
      };

      const result = mediaUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty alt text", () => {
      const invalidData = {
        alt: "",
        format: "WEBP" as const,
      };

      const result = mediaUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("обязателен");
      }
    });

    it("should reject alt text longer than 140 characters", () => {
      const invalidData = {
        alt: "a".repeat(141),
        format: "WEBP" as const,
      };

      const result = mediaUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from alt text", () => {
      const dataWithWhitespace = {
        alt: "  Product image  ",
        format: "WEBP" as const,
      };

      const result = mediaUploadSchema.safeParse(dataWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.alt).toBe("Product image");
      }
    });

    it("should accept alt text at boundary (140 characters)", () => {
      const validData = {
        alt: "a".repeat(140),
        format: "WEBP" as const,
      };

      const result = mediaUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid format", () => {
      const invalidData = {
        alt: "Product image",
        format: "GIF" as any,
      };

      const result = mediaUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("imageFormatEnum", () => {
    it("should accept WEBP", () => {
      const result = imageFormatEnum.safeParse("WEBP");
      expect(result.success).toBe(true);
    });

    it("should accept AVIF", () => {
      const result = imageFormatEnum.safeParse("AVIF");
      expect(result.success).toBe(true);
    });

    it("should accept JPEG", () => {
      const result = imageFormatEnum.safeParse("JPEG");
      expect(result.success).toBe(true);
    });

    it("should accept PNG", () => {
      const result = imageFormatEnum.safeParse("PNG");
      expect(result.success).toBe(true);
    });

    it("should reject invalid format", () => {
      const result = imageFormatEnum.safeParse("GIF");
      expect(result.success).toBe(false);
    });
  });

  describe("validateUploadedFile helper", () => {
    it("should validate correct JPEG file", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate correct PNG file", () => {
      const file = new File(["content"], "test.png", { type: "image/png" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
    });

    it("should validate correct WEBP file", () => {
      const file = new File(["content"], "test.webp", { type: "image/webp" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
    });

    it("should validate correct AVIF file", () => {
      const file = new File(["content"], "test.avif", { type: "image/avif" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
    });

    it("should reject unsupported MIME type", () => {
      const file = new File(["content"], "test.gif", { type: "image/gif" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Неподдерживаемый формат");
    });

    it("should reject file larger than 10MB", () => {
      // Create buffer larger than 10MB
      const largeBuffer = new ArrayBuffer(MAX_FILE_SIZE_BYTES + 1);
      const file = new File([largeBuffer], "test.jpg", { type: "image/jpeg" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("слишком большой");
    });

    it("should accept file at maximum size (10MB)", () => {
      const maxContent = new Array(MAX_FILE_SIZE_BYTES).join("a");
      const file = new File([maxContent], "test.jpg", { type: "image/jpeg" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
    });

    it("should reject invalid file extension", () => {
      const file = new File(["content"], "test.txt", { type: "image/jpeg" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("расширение");
    });

    it("should reject file without extension", () => {
      const file = new File(["content"], "test", { type: "image/jpeg" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(false);
    });

    it("should accept .jpg extension", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
    });

    it("should accept .jpeg extension", () => {
      const file = new File(["content"], "test.jpeg", { type: "image/jpeg" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
    });

    it("should accept case-insensitive extensions", () => {
      const file = new File(["content"], "test.JPG", { type: "image/jpeg" });
      const result = validateUploadedFile(file);

      expect(result.valid).toBe(true);
    });
  });

  describe("getImageFormatLabel helper", () => {
    it("should return label for WEBP", () => {
      const result = getImageFormatLabel("WEBP");
      expect(result).toBe("WebP");
    });

    it("should return label for AVIF", () => {
      const result = getImageFormatLabel("AVIF");
      expect(result).toBe("AVIF");
    });

    it("should return label for JPEG", () => {
      const result = getImageFormatLabel("JPEG");
      expect(result).toBe("JPEG");
    });

    it("should return label for PNG", () => {
      const result = getImageFormatLabel("PNG");
      expect(result).toBe("PNG");
    });
  });

  describe("mimeToImageFormat helper", () => {
    it("should convert image/webp to WEBP", () => {
      const result = mimeToImageFormat("image/webp");
      expect(result).toBe("WEBP");
    });

    it("should convert image/avif to AVIF", () => {
      const result = mimeToImageFormat("image/avif");
      expect(result).toBe("AVIF");
    });

    it("should convert image/png to PNG", () => {
      const result = mimeToImageFormat("image/png");
      expect(result).toBe("PNG");
    });

    it("should convert image/jpeg to JPEG", () => {
      const result = mimeToImageFormat("image/jpeg");
      expect(result).toBe("JPEG");
    });

    it("should convert image/jpg to JPEG", () => {
      const result = mimeToImageFormat("image/jpg");
      expect(result).toBe("JPEG");
    });

    it("should default to JPEG for unknown MIME type", () => {
      const result = mimeToImageFormat("image/unknown");
      expect(result).toBe("JPEG");
    });
  });

  describe("Constants", () => {
    it("ALLOWED_IMAGE_MIMES should contain 5 formats", () => {
      expect(ALLOWED_IMAGE_MIMES).toHaveLength(5);
    });

    it("MAX_FILE_SIZE_BYTES should be 10MB", () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    });
  });
});
