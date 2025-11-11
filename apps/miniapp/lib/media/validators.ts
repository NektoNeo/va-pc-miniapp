/**
 * Media Validation Functions
 * Zod schemas and validation for file uploads, aspect ratios, and alt text
 */

import { z } from "zod";
import sharp from "sharp";
import {
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  BLOCKED_MIMES,
  FILE_SIZE_LIMITS,
  ASPECT_RULES,
  type MediaKind,
  type ValidationResult,
  type AllowedImageMime,
  type AllowedVideoMime,
} from "./types";

// ============================================================================
// Zod Schemas
// ============================================================================

export const SignUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  sizeBytes: z.number().positive(),
  kind: z.enum(["cover", "gallery", "promo", "device"]),
  entitySlug: z.string().min(1).max(100),
});

export const CompleteUploadSchema = z.object({
  uploadId: z.string().cuid(),
  alt: z.string().min(1).max(140),
});

export const DeleteAssetSchema = z.object({
  assetId: z.string().cuid(),
  type: z.enum(["image", "video"]),
});

// ============================================================================
// File Size Validation
// ============================================================================

/**
 * Validate file size based on type
 */
export function validateFileSize(
  sizeBytes: number,
  type: "image" | "video"
): ValidationResult {
  const errors = [];

  if (type === "image") {
    if (sizeBytes > FILE_SIZE_LIMITS.IMAGE_MAX) {
      errors.push({
        field: "file",
        message: `File size ${(sizeBytes / 1024 / 1024).toFixed(2)}MB exceeds maximum ${FILE_SIZE_LIMITS.IMAGE_MAX / 1024 / 1024}MB for images`,
        code: "FILE_TOO_LARGE",
      });
    }
  } else if (type === "video") {
    if (sizeBytes > FILE_SIZE_LIMITS.VIDEO_MAX) {
      errors.push({
        field: "file",
        message: `File size ${(sizeBytes / 1024 / 1024).toFixed(2)}MB exceeds maximum ${FILE_SIZE_LIMITS.VIDEO_MAX / 1024 / 1024}MB for videos`,
        code: "FILE_TOO_LARGE",
      });
    }
  }

  const warnings = [];
  if (type === "image" && sizeBytes > FILE_SIZE_LIMITS.IMAGE_PREFERRED) {
    warnings.push(
      `File size ${(sizeBytes / 1024 / 1024).toFixed(2)}MB exceeds preferred limit ${FILE_SIZE_LIMITS.IMAGE_PREFERRED / 1024 / 1024}MB. Consider optimizing the image.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// MIME Type Validation
// ============================================================================

/**
 * Validate MIME type is allowed and not blocked
 */
export function validateMIMEType(mime: string, type: "image" | "video"): ValidationResult {
  const errors = [];

  // Check if blocked
  if ((BLOCKED_MIMES as readonly string[]).includes(mime)) {
    errors.push({
      field: "contentType",
      message: `File type ${mime} is blocked for security reasons`,
      code: "BLOCKED_MIME_TYPE",
    });
  }

  // Check if allowed
  const allowedMimes =
    type === "image"
      ? (ALLOWED_IMAGE_MIMES as readonly string[])
      : (ALLOWED_VIDEO_MIMES as readonly string[]);

  if (!allowedMimes.includes(mime)) {
    errors.push({
      field: "contentType",
      message: `File type ${mime} is not supported. Allowed: ${allowedMimes.join(", ")}`,
      code: "UNSUPPORTED_MIME_TYPE",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Aspect Ratio Validation
// ============================================================================

/**
 * Validate image aspect ratio matches requirements for given kind
 */
export function validateAspectRatio(
  width: number,
  height: number,
  kind: MediaKind
): ValidationResult {
  const errors = [];
  const rules = ASPECT_RULES[kind];
  const actualRatio = width / height;

  let matchesAnyRule = false;

  for (const rule of rules) {
    const minRatio = rule.ratio * (1 - rule.tolerance);
    const maxRatio = rule.ratio * (1 + rule.tolerance);

    if (actualRatio >= minRatio && actualRatio <= maxRatio) {
      // Check minimum dimensions
      if (width < rule.min.w || height < rule.min.h) {
        errors.push({
          field: "dimensions",
          message: `Image dimensions ${width}×${height} are below minimum ${rule.min.w}×${rule.min.h} for ${kind} (${rule.label})`,
          code: "DIMENSIONS_TOO_SMALL",
        });
      } else {
        matchesAnyRule = true;
        break;
      }
    }
  }

  if (!matchesAnyRule && errors.length === 0) {
    const expectedRatios = rules.map((r) => r.label).join(" or ");
    errors.push({
      field: "dimensions",
      message: `Image aspect ratio ${actualRatio.toFixed(2)} doesn't match required ${expectedRatios} (±tolerance) for ${kind}`,
      code: "INVALID_ASPECT_RATIO",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate image from buffer
 */
export async function validateImageBuffer(
  buffer: Buffer,
  kind: MediaKind
): Promise<ValidationResult> {
  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        errors: [
          {
            field: "image",
            message: "Unable to read image dimensions",
            code: "INVALID_IMAGE",
          },
        ],
      };
    }

    return validateAspectRatio(metadata.width, metadata.height, kind);
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          field: "image",
          message: `Failed to process image: ${error instanceof Error ? error.message : "Unknown error"}`,
          code: "PROCESSING_ERROR",
        },
      ],
    };
  }
}

// ============================================================================
// Alt Text Validation
// ============================================================================

/**
 * Validate alt text meets requirements
 */
export function validateAltText(alt: string): ValidationResult {
  const errors = [];

  if (!alt || alt.trim().length === 0) {
    errors.push({
      field: "alt",
      message: "Alt text is required for accessibility",
      code: "ALT_REQUIRED",
    });
  }

  if (alt.length > 140) {
    errors.push({
      field: "alt",
      message: `Alt text must be 140 characters or less (current: ${alt.length})`,
      code: "ALT_TOO_LONG",
    });
  }

  // Check for valid characters (EN + RU letters, numbers, basic punctuation)
  const validPattern = /^[a-zA-Zа-яА-ЯёЁ0-9\s.,!?;:()\-—–'"«»]+$/;
  if (alt && !validPattern.test(alt)) {
    errors.push({
      field: "alt",
      message: "Alt text contains invalid characters. Use English/Russian letters, numbers, and basic punctuation only.",
      code: "ALT_INVALID_CHARS",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Combined Validation
// ============================================================================

/**
 * Validate all aspects of file upload request
 */
export async function validateUploadRequest(
  filename: string,
  contentType: string,
  sizeBytes: number,
  kind: MediaKind,
  buffer: Buffer
): Promise<ValidationResult> {
  const allErrors = [];
  const allWarnings = [];

  // Determine type from MIME
  const type = contentType.startsWith("image/") ? "image" : "video";

  // Validate MIME type
  const mimeValidation = validateMIMEType(contentType, type);
  allErrors.push(...mimeValidation.errors);

  // Validate file size
  const sizeValidation = validateFileSize(sizeBytes, type);
  allErrors.push(...sizeValidation.errors);
  if (sizeValidation.warnings) {
    allWarnings.push(...sizeValidation.warnings);
  }

  // Validate image-specific requirements
  if (type === "image") {
    const imageValidation = await validateImageBuffer(buffer, kind);
    allErrors.push(...imageValidation.errors);
    if (imageValidation.warnings) {
      allWarnings.push(...imageValidation.warnings);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
  };
}
