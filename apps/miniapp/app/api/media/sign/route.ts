/**
 * POST /api/media/sign
 * Generate signed S3 upload URL for direct client upload
 */

import { NextRequest, NextResponse } from "next/server";
import { SignUploadSchema } from "@/lib/media/validators";
import { validateFileSize, validateMIMEType } from "@/lib/media/validators";
import { getSignedUploadUrl } from "@/lib/media/storage";
import { buildS3Key } from "@/lib/media/utils";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = SignUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { filename, contentType, sizeBytes, kind, entitySlug } = validation.data;

    // Determine media type
    const mediaType = contentType.startsWith("image/") ? "image" : "video";

    // Validate file size
    const sizeValidation = validateFileSize(sizeBytes, mediaType);
    if (!sizeValidation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: sizeValidation.errors,
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    const mimeValidation = validateMIMEType(contentType, mediaType);
    if (!mimeValidation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: mimeValidation.errors,
        },
        { status: 400 }
      );
    }

    // Generate upload ID for tracking
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Build S3 key for upload (temporary location)
    const key = buildS3Key(entitySlug, kind, uploadId, "upload");

    // Generate signed URL (10 minutes expiry)
    const uploadUrl = await getSignedUploadUrl(key, contentType, 600);

    return NextResponse.json(
      {
        uploadId,
        uploadUrl,
        key,
        expiresIn: 600,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
