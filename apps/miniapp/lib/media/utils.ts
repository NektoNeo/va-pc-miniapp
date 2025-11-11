/**
 * Media Utility Functions
 * Provides hashing, MIME detection, blurhash generation, and color analysis
 */

import { createHash } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { encode as encodeBlurhash } from "blurhash";
import sharp from "sharp";
import type { BrandColorAnalysis } from "./types";

// ============================================================================
// Content Hashing
// ============================================================================

/**
 * Generate MD5 hash of buffer content for cache busting
 * @param buffer - File buffer
 * @returns First 8 characters of MD5 hash
 */
export function generateContentHash(buffer: Buffer): string {
  const hash = createHash("md5").update(buffer).digest("hex");
  return hash.substring(0, 8);
}

// ============================================================================
// MIME Type Detection
// ============================================================================

/**
 * Detect MIME type from file buffer using magic bytes
 * @param buffer - File buffer
 * @returns Detected MIME type or null if unknown
 */
export async function detectMIMEType(buffer: Buffer): Promise<string | null> {
  const fileType = await fileTypeFromBuffer(buffer);
  return fileType?.mime || null;
}

/**
 * Verify that detected MIME type matches declared MIME type
 * @param buffer - File buffer
 * @param declaredMime - MIME type from Content-Type header
 * @returns true if matches, false otherwise
 */
export async function verifyMIMEType(
  buffer: Buffer,
  declaredMime: string
): Promise<boolean> {
  const detected = await detectMIMEType(buffer);

  if (!detected) {
    return false;
  }

  // Normalize MIME types (some libraries report different variants)
  const normalizedDetected = detected.toLowerCase();
  const normalizedDeclared = declaredMime.toLowerCase();

  return normalizedDetected === normalizedDeclared;
}

// ============================================================================
// Blurhash Generation
// ============================================================================

/**
 * Generate blurhash placeholder from image buffer
 * @param buffer - Image buffer
 * @param componentX - Horizontal complexity (default: 4)
 * @param componentY - Vertical complexity (default: 3)
 * @returns Blurhash string
 */
export async function generateBlurhash(
  buffer: Buffer,
  componentX = 4,
  componentY = 3
): Promise<string> {
  // Resize to small size for faster processing
  const { data, info } = await sharp(buffer)
    .resize(32, 32, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return encodeBlurhash(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    componentX,
    componentY
  );
}

// ============================================================================
// Average Color Extraction
// ============================================================================

/**
 * Extract average color from image as hex string
 * @param buffer - Image buffer
 * @returns Hex color string (#RRGGBB)
 */
export async function extractAvgColor(buffer: Buffer): Promise<string> {
  const { dominant } = await sharp(buffer).resize(1, 1).raw().toBuffer({ resolveWithObject: true });

  // Get first pixel RGB values
  const r = dominant[0];
  const g = dominant[1];
  const b = dominant[2];

  // Convert to hex
  const toHex = (n: number) => n.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ============================================================================
// Brand Color Validation
// ============================================================================

/**
 * Analyze image for brand color compliance
 * Warns if image contains yellow hues or deviates from brand palette
 * @param buffer - Image buffer
 * @returns Brand color analysis result
 */
export async function analyzeBrandColors(buffer: Buffer): Promise<BrandColorAnalysis> {
  // Get dominant colors stats
  const { dominant } = await sharp(buffer)
    .resize(100, 100, { fit: "cover" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert RGB to HSL to analyze hue
  const r = dominant[0] / 255;
  const g = dominant[1] / 255;
  const b = dominant[2] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      hue = ((b - r) / delta + 2) / 6;
    } else {
      hue = ((r - g) / delta + 4) / 6;
    }
  }

  // Convert to degrees
  const avgHue = Math.round(hue * 360);

  // Check for yellow (45-65 degrees)
  const isYellow = avgHue >= 45 && avgHue <= 65;

  // Check for brand violet (270-300 degrees)
  const isViolet = avgHue >= 270 && avgHue <= 300;

  // Check for dark/neutral (graphite) - low saturation
  const saturation = delta === 0 ? 0 : delta / max;
  const isNeutral = saturation < 0.2;

  const deviatesFromBrand = !isViolet && !isNeutral;

  let message: string | undefined;

  if (isYellow) {
    message = `⚠️ Image contains yellow hues (${avgHue}°). Brand guideline: NO YELLOW. Please adjust colors.`;
  } else if (deviatesFromBrand) {
    message = `ℹ️ Image hue (${avgHue}°) deviates from brand palette (violet 270-300° or neutral). Consider adjusting for brand consistency.`;
  }

  return {
    avgHue,
    isYellow,
    deviatesFromBrand,
    message,
  };
}

// ============================================================================
// Slug Generation
// ============================================================================

/**
 * Sanitize and slugify entity name for file naming
 * @param name - Entity name
 * @returns Slugified name (kebab-case)
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens
}

/**
 * Build S3 key for media file
 * @param entitySlug - Slugified entity name
 * @param kind - Media kind (cover, gallery, etc.)
 * @param suffix - Optional suffix (e.g., "320w", "original")
 * @param extension - File extension (e.g., "avif", "webp", "jpg")
 * @returns S3 object key
 */
export function buildS3Key(
  entitySlug: string,
  kind: string,
  suffix: string,
  extension: string
): string {
  return `${entitySlug}__${kind}__${suffix}.${extension}`;
}
