/**
 * Image Processing Pipeline
 * Sharp-based image processing: derivatives generation, color conversion, EXIF handling
 */

import sharp from "sharp";
import {
  DERIVATIVE_SIZES,
  DERIVATIVE_FORMATS,
  type ProcessedImage,
  type ProcessedDerivative,
} from "./types";
import { generateBlurhash, extractAvgColor, generateContentHash, buildS3Key } from "./utils";

/**
 * Process image buffer into multiple derivatives
 * @param buffer - Original image buffer
 * @param entitySlug - Entity slug for naming
 * @param kind - Media kind (cover, gallery, etc.)
 * @returns Processed image with all derivatives
 */
export async function processImage(
  buffer: Buffer,
  entitySlug: string,
  kind: string
): Promise<ProcessedImage> {
  // Get original metadata
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to read image dimensions");
  }

  // Convert to sRGB and strip unsafe EXIF
  const processedBuffer = await sharp(buffer)
    .withMetadata({ orientation: metadata.orientation }) // Keep orientation
    .toColorspace("srgb")
    .toBuffer();

  // Generate placeholders
  const [blurhash, avgColor, contentHash] = await Promise.all([
    generateBlurhash(processedBuffer),
    extractAvgColor(processedBuffer),
    Promise.resolve(generateContentHash(processedBuffer)),
  ]);

  // Determine original format extension
  const originalFormat = metadata.format || "jpg";
  const originalKey = buildS3Key(entitySlug, kind, "original", originalFormat);

  const original = {
    key: originalKey,
    width: metadata.width,
    height: metadata.height,
    sizeBytes: buffer.length,
  };

  // Generate derivatives
  const derivatives: ProcessedDerivative[] = [];

  for (const size of DERIVATIVE_SIZES) {
    for (const format of DERIVATIVE_FORMATS) {
      // Skip if original is smaller than target size
      const longEdge = Math.max(metadata.width, metadata.height);
      if (longEdge < size) {
        continue;
      }

      // Calculate dimensions maintaining aspect ratio
      const isPortrait = metadata.height > metadata.width;
      const targetWidth = isPortrait ? Math.round((size * metadata.width) / metadata.height) : size;
      const targetHeight = isPortrait ? size : Math.round((size * metadata.height) / metadata.width);

      // Process derivative
      const derivativeBuffer = await sharp(processedBuffer)
        .resize(targetWidth, targetHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        [format]({ quality: format === "avif" ? 60 : 80 })
        .toBuffer();

      const key = buildS3Key(entitySlug, kind, `${size}w`, format);

      derivatives.push({
        key,
        width: targetWidth,
        height: targetHeight,
        sizeBytes: derivativeBuffer.length,
        format,
      });
    }
  }

  return {
    original,
    sizes: derivatives,
    blurhash,
    avgColor,
    contentHash,
  };
}

/**
 * Get derivative buffer for upload
 * @param buffer - Original image buffer
 * @param width - Target width
 * @param format - Target format
 * @returns Processed derivative buffer
 */
export async function generateDerivativeBuffer(
  buffer: Buffer,
  width: number,
  format: "avif" | "webp"
): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, undefined, {
      fit: "inside",
      withoutEnlargement: true,
    })
    [format]({ quality: format === "avif" ? 60 : 80 })
    .toBuffer();
}
