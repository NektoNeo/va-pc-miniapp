import { describe, it, expect } from "vitest";
import {
  fpsMetricFormSchema,
  resolutionEnum,
  getResolutionLabel,
  getResolutionShortLabel,
} from "@/lib/validations/fps-metrics";

describe("FPS Metrics Validation", () => {
  describe("fpsMetricFormSchema", () => {
    it("should validate valid FPS metric data", () => {
      const validData = {
        game: "Cyberpunk 2077",
        resolution: "FHD" as const,
        fpsMin: 60,
        fpsAvg: 90,
        fpsP95: 120,
      };

      const result = fpsMetricFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate with null optional fields", () => {
      const validData = {
        game: "CS2",
        resolution: "QHD" as const,
        fpsMin: null,
        fpsAvg: 200,
        fpsP95: null,
      };

      const result = fpsMetricFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate with missing optional fields", () => {
      const validData = {
        game: "Valorant",
        resolution: "FHD" as const,
        fpsAvg: 240,
      };

      const result = fpsMetricFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept FHD resolution", () => {
      const validData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsAvg: 200,
      };

      const result = fpsMetricFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept QHD resolution", () => {
      const validData = {
        game: "CS2",
        resolution: "QHD" as const,
        fpsAvg: 150,
      };

      const result = fpsMetricFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept UHD4K resolution", () => {
      const validData = {
        game: "Cyberpunk 2077",
        resolution: "UHD4K" as const,
        fpsAvg: 60,
      };

      const result = fpsMetricFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid resolution", () => {
      const invalidData = {
        game: "CS2",
        resolution: "INVALID" as any,
        fpsAvg: 200,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty game name", () => {
      const invalidData = {
        game: "",
        resolution: "FHD" as const,
        fpsAvg: 200,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject game name longer than 100 characters", () => {
      const invalidData = {
        game: "a".repeat(101),
        resolution: "FHD" as const,
        fpsAvg: 200,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing fpsAvg", () => {
      const invalidData = {
        game: "CS2",
        resolution: "FHD" as const,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("обязателен");
      }
    });

    it("should reject non-integer fpsAvg", () => {
      const invalidData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsAvg: 200.5,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative fpsAvg", () => {
      const invalidData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsAvg: -100,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject zero fpsAvg", () => {
      const invalidData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsAvg: 0,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject fpsAvg above 999", () => {
      const invalidData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsAvg: 1000,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept fpsAvg at boundary (999)", () => {
      const validData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsAvg: 999,
      };

      const result = fpsMetricFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject non-integer fpsMin", () => {
      const invalidData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsMin: 50.5,
        fpsAvg: 200,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative fpsMin", () => {
      const invalidData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsMin: -50,
        fpsAvg: 200,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject fpsMin above 999", () => {
      const invalidData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsMin: 1000,
        fpsAvg: 200,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer fpsP95", () => {
      const invalidData = {
        game: "CS2",
        resolution: "FHD" as const,
        fpsAvg: 200,
        fpsP95: 250.5,
      };

      const result = fpsMetricFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("resolutionEnum", () => {
    it("should accept FHD", () => {
      const result = resolutionEnum.safeParse("FHD");
      expect(result.success).toBe(true);
    });

    it("should accept QHD", () => {
      const result = resolutionEnum.safeParse("QHD");
      expect(result.success).toBe(true);
    });

    it("should accept UHD4K", () => {
      const result = resolutionEnum.safeParse("UHD4K");
      expect(result.success).toBe(true);
    });

    it("should reject invalid resolution", () => {
      const result = resolutionEnum.safeParse("INVALID");
      expect(result.success).toBe(false);
    });
  });

  describe("getResolutionLabel helper", () => {
    it("should return full label for FHD", () => {
      const result = getResolutionLabel("FHD");
      expect(result).toBe("Full HD (1080p)");
    });

    it("should return full label for QHD", () => {
      const result = getResolutionLabel("QHD");
      expect(result).toBe("2K (1440p)");
    });

    it("should return full label for UHD4K", () => {
      const result = getResolutionLabel("UHD4K");
      expect(result).toBe("4K (2160p)");
    });
  });

  describe("getResolutionShortLabel helper", () => {
    it("should return short label for FHD", () => {
      const result = getResolutionShortLabel("FHD");
      expect(result).toBe("1080p");
    });

    it("should return short label for QHD", () => {
      const result = getResolutionShortLabel("QHD");
      expect(result).toBe("1440p");
    });

    it("should return short label for UHD4K", () => {
      const result = getResolutionShortLabel("UHD4K");
      expect(result).toBe("4K");
    });
  });
});
