/**
 * Media Pipeline Types for VA-PC
 * Defines TypeScript types for image/video processing, storage, and validation
 */

import { ImageFormat } from "@prisma/client";

// ============================================================================
// Media Kinds
// ============================================================================

export type MediaKind = "cover" | "gallery" | "promo" | "device";

export type MediaType = "image" | "video";

// ============================================================================
// Image Processing
// ============================================================================

export interface DerivativeSize {
  width: number; // Target width (long edge)
  format: "avif" | "webp";
}

export const DERIVATIVE_SIZES: readonly number[] = [320, 640, 1280, 2048] as const;

export const DERIVATIVE_FORMATS: readonly ("avif" | "webp")[] = ["avif", "webp"] as const;

export interface ProcessedDerivative {
  key: string; // S3 object key: "slug__kind__320w.avif"
  width: number;
  height: number;
  sizeBytes: number;
  format: "avif" | "webp";
}

export interface ProcessedImage {
  original: {
    key: string; // "slug__kind__original.jpg"
    width: number;
    height: number;
    sizeBytes: number;
  };
  sizes: ProcessedDerivative[];
  blurhash: string;
  avgColor: string; // Hex color: #RRGGBB
  contentHash: string; // MD5 hash for cache busting
}

// ============================================================================
// Aspect Ratio Validation
// ============================================================================

export interface AspectRatioRule {
  ratio: number; // e.g., 1.78 for 16:9
  tolerance: number; // e.g., 0.05 for ±5%
  min: { w: number; h: number };
  label: string; // e.g., "16:9"
}

export const ASPECT_RULES: Record<MediaKind, AspectRatioRule[]> = {
  cover: [
    { ratio: 0.8, tolerance: 0.05, min: { w: 1200, h: 1500 }, label: "4:5" },
    { ratio: 0.75, tolerance: 0.05, min: { w: 1200, h: 1600 }, label: "3:4" },
  ],
  gallery: [
    { ratio: 1.78, tolerance: 0.05, min: { w: 1920, h: 1080 }, label: "16:9" },
    { ratio: 1.5, tolerance: 0.05, min: { w: 1800, h: 1200 }, label: "3:2" },
  ],
  promo: [{ ratio: 1.78, tolerance: 0.03, min: { w: 1920, h: 1080 }, label: "16:9" }],
  device: [{ ratio: 1.0, tolerance: 0.03, min: { w: 1200, h: 1200 }, label: "1:1" }],
};

// ============================================================================
// File Size Limits
// ============================================================================

export const FILE_SIZE_LIMITS = {
  IMAGE_MAX: 10 * 1024 * 1024, // 10MB (hard limit)
  IMAGE_PREFERRED: 4 * 1024 * 1024, // 4MB (preferred)
  VIDEO_MAX: 100 * 1024 * 1024, // 100MB
} as const;

// ============================================================================
// MIME Types
// ============================================================================

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/webm"] as const;

export const BLOCKED_MIMES = ["image/svg+xml"] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];
export type AllowedVideoMime = (typeof ALLOWED_VIDEO_MIMES)[number];

// ============================================================================
// Validation Results
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: string[]; // For informational messages (e.g., brand color deviation)
}

// ============================================================================
// API Contracts
// ============================================================================

// POST /api/media/sign
export interface SignUploadRequest {
  filename: string;
  contentType: string;
  sizeBytes: number;
  kind: MediaKind;
  entitySlug: string;
}

export interface SignUploadResponse {
  uploadId: string; // cuid for tracking
  uploadUrl: string; // Signed S3 PUT URL
  key: string; // S3 key for upload
  expiresIn: number; // Seconds until URL expires (600)
}

// POST /api/media/complete
export interface CompleteUploadRequest {
  uploadId: string;
  alt: string; // Required, max 140 chars
}

export interface CompleteUploadResponse {
  imageAsset: {
    id: string;
    key: string;
    width: number;
    height: number;
    blurhash: string;
    avgColor: string;
    derivatives: ProcessedImage;
    cdnUrl: string; // Base CDN URL
  };
}

// DELETE /api/media/delete
export interface DeleteAssetRequest {
  assetId: string;
  type: MediaType;
}

export interface DeleteAssetResponse {
  success: boolean;
  deletedKeys: string[]; // List of S3 keys deleted
}

// ============================================================================
// S3/Storage
// ============================================================================

export interface S3Config {
  bucket: string;
  region: string;
  endpoint?: string; // For Cloudflare R2
  accessKeyId: string;
  secretAccessKey: string;
  cdnBaseUrl: string;
}

export interface UploadProgress {
  uploadId: string;
  filename: string;
  progress: number; // 0-100
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  error?: string;
}

// ============================================================================
// Brand Validation
// ============================================================================

export interface BrandColorAnalysis {
  avgHue: number; // 0-360 degrees
  isYellow: boolean; // Hue in 45-65 range (blocked)
  deviatesFromBrand: boolean; // Deviates significantly from violet (270-300)
  message?: string;
}

// ============================================================================
// Video Processing
// ============================================================================

export interface VideoMetadata {
  width: number;
  height: number;
  durationSec: number;
  posterKey?: string; // Generated poster image S3 key
}
