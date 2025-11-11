import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Create admin user validation schema
 * (For future use in user management)
 */
export const createAdminSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  name: z.string().min(1, "Name is required").max(100).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MODERATOR"]).default("ADMIN"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

/**
 * Update admin user validation schema
 * (For future use in user management)
 */
export const updateAdminSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MODERATOR"]).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).max(100).optional(),
});

export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
