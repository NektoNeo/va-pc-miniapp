/**
 * S3/R2 Client Configuration
 * Singleton S3 client for Cloudflare R2 or AWS S3
 */

import { S3Client } from "@aws-sdk/client-s3";
import type { S3Config } from "./types";

// ============================================================================
// Environment Variables
// ============================================================================

function getS3Config(): S3Config {
  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const cdnBaseUrl = process.env.CDN_BASE_URL;

  if (!bucket) {
    throw new Error("S3_BUCKET_NAME environment variable is required");
  }
  if (!accessKeyId) {
    throw new Error("S3_ACCESS_KEY_ID environment variable is required");
  }
  if (!secretAccessKey) {
    throw new Error("S3_SECRET_ACCESS_KEY environment variable is required");
  }
  if (!cdnBaseUrl) {
    throw new Error("CDN_BASE_URL environment variable is required");
  }

  return {
    bucket,
    region,
    endpoint,
    accessKeyId,
    secretAccessKey,
    cdnBaseUrl,
  };
}

// ============================================================================
// S3 Client Singleton
// ============================================================================

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  const config = getS3Config();

  s3ClientInstance = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // For Cloudflare R2 compatibility
    forcePathStyle: !!config.endpoint,
  });

  return s3ClientInstance;
}

// ============================================================================
// Configuration Getters
// ============================================================================

export function getS3Bucket(): string {
  return getS3Config().bucket;
}

export function getCDNBaseUrl(): string {
  return getS3Config().cdnBaseUrl;
}

// ============================================================================
// CDN URL Builder
// ============================================================================

/**
 * Build CDN URL for a given S3 key with optional cache busting
 * @param key - S3 object key
 * @param contentHash - Optional hash for cache busting
 * @returns Full CDN URL
 */
export function buildCDNUrl(key: string, contentHash?: string): string {
  const baseUrl = getCDNBaseUrl();
  const url = `${baseUrl}/${key}`;

  if (contentHash) {
    return `${url}?v=${contentHash}`;
  }

  return url;
}

/**
 * Build derivative CDN URLs for responsive images
 * @param baseKey - Base key without size/format: "slug__cover"
 * @param sizes - Array of processed derivatives
 * @param contentHash - Hash for cache busting
 * @returns Object with srcSet strings for AVIF and WebP
 */
export function buildResponsiveSrcSet(
  baseKey: string,
  sizes: Array<{ width: number; format: "avif" | "webp" }>,
  contentHash: string
): { avif: string; webp: string } {
  const avifSizes = sizes.filter((s) => s.format === "avif");
  const webpSizes = sizes.filter((s) => s.format === "webp");

  const avifSrcSet = avifSizes
    .map((s) => `${buildCDNUrl(`${baseKey}__${s.width}w.avif`, contentHash)} ${s.width}w`)
    .join(", ");

  const webpSrcSet = webpSizes
    .map((s) => `${buildCDNUrl(`${baseKey}__${s.width}w.webp`, contentHash)} ${s.width}w`)
    .join(", ");

  return { avif: avifSrcSet, webp: webpSrcSet };
}
