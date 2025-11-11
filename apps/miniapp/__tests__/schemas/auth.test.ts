import { describe, it, expect } from "vitest";
import {
  loginSchema,
  createAdminSchema,
  updateAdminSchema,
} from "@/lib/validations/auth";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should validate valid login data", () => {
      const validData = {
        email: "admin@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject empty email", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Email is required");
      }
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid email format");
      }
    });

    it("should reject password shorter than 8 characters", () => {
      const invalidData = {
        email: "admin@example.com",
        password: "short",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 8 characters");
      }
    });

    it("should reject password longer than 100 characters", () => {
      const invalidData = {
        email: "admin@example.com",
        password: "a".repeat(101),
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("too long");
      }
    });

    it("should accept password exactly 8 characters", () => {
      const validData = {
        email: "admin@example.com",
        password: "12345678",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept password exactly 100 characters", () => {
      const validData = {
        email: "admin@example.com",
        password: "a".repeat(100),
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("createAdminSchema", () => {
    it("should validate valid create admin data", () => {
      const validData = {
        email: "newadmin@example.com",
        password: "securePass123",
        name: "John Doe",
        role: "ADMIN" as const,
      };

      const result = createAdminSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should apply default role ADMIN when not provided", () => {
      const dataWithoutRole = {
        email: "newadmin@example.com",
        password: "securePass123",
      };

      const result = createAdminSchema.safeParse(dataWithoutRole);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("ADMIN");
      }
    });

    it("should accept SUPER_ADMIN role", () => {
      const validData = {
        email: "superadmin@example.com",
        password: "securePass123",
        role: "SUPER_ADMIN" as const,
      };

      const result = createAdminSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("SUPER_ADMIN");
      }
    });

    it("should accept MODERATOR role", () => {
      const validData = {
        email: "moderator@example.com",
        password: "securePass123",
        role: "MODERATOR" as const,
      };

      const result = createAdminSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("MODERATOR");
      }
    });

    it("should reject invalid role", () => {
      const invalidData = {
        email: "admin@example.com",
        password: "securePass123",
        role: "INVALID_ROLE",
      };

      const result = createAdminSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept optional name field", () => {
      const dataWithName = {
        email: "admin@example.com",
        password: "securePass123",
        name: "Admin User",
      };

      const result = createAdminSchema.safeParse(dataWithName);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Admin User");
      }
    });

    it("should accept missing name field", () => {
      const dataWithoutName = {
        email: "admin@example.com",
        password: "securePass123",
      };

      const result = createAdminSchema.safeParse(dataWithoutName);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        email: "invalid-email",
        password: "securePass123",
      };

      const result = createAdminSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateAdminSchema", () => {
    it("should validate with all fields present", () => {
      const validData = {
        email: "updated@example.com",
        name: "Updated Name",
        role: "SUPER_ADMIN" as const,
        active: false,
        password: "newPassword123",
      };

      const result = updateAdminSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate with partial fields", () => {
      const partialData = {
        name: "Updated Name Only",
      };

      const result = updateAdminSchema.safeParse(partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Updated Name Only");
      }
    });

    it("should validate with only email update", () => {
      const emailOnly = {
        email: "newemail@example.com",
      };

      const result = updateAdminSchema.safeParse(emailOnly);
      expect(result.success).toBe(true);
    });

    it("should validate with only role update", () => {
      const roleOnly = {
        role: "MODERATOR" as const,
      };

      const result = updateAdminSchema.safeParse(roleOnly);
      expect(result.success).toBe(true);
    });

    it("should validate with only active status update", () => {
      const activeOnly = {
        active: false,
      };

      const result = updateAdminSchema.safeParse(activeOnly);
      expect(result.success).toBe(true);
    });

    it("should validate with empty object", () => {
      const emptyData = {};

      const result = updateAdminSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const invalidData = {
        email: "not-valid-email",
      };

      const result = updateAdminSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const invalidData = {
        password: "short",
      };

      const result = updateAdminSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid role value", () => {
      const invalidData = {
        role: "INVALID" as any,
      };

      const result = updateAdminSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
