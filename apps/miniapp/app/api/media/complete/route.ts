/**
 * POST /api/media/complete
 * Complete upload: download from S3, process, generate derivatives, create DB record
 */

import { NextRequest, NextResponse } from "next/server";
import { CompleteUploadSchema } from "@/lib/media/validators";
import { validateAltText, validateImageBuffer } from "@/lib/media/validators";
import { downloadFromS3, uploadToS3, deleteFromS3 } from "@/lib/media/storage";
import { processImage, generateDerivativeBuffer } from "@/lib/media/processor";
import { analyzeBrandColors, verifyMIMEType } from "@/lib/media/utils";
import { buildCDNUrl } from "@/lib/media/s3-client";
import { prisma } from "@/lib/prisma";
import type { MediaKind } from "@/lib/media/types";

export const maxDuration = 60; // 60 seconds timeout for processing

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validation = CompleteUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { uploadId, alt } = validation.data;

    // Validate alt text
    const altValidation = validateAltText(alt);
    if (!altValidation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: altValidation.errors },
        { status: 400 }
      );
    }

    // Download uploaded file from S3
    // Note: uploadId contains full key from sign endpoint
    const buffer = await downloadFromS3(uploadId);

    // Verify MIME type matches declared type (magic bytes check)
    const declaredMime = "image/jpeg"; // TODO: Get from upload metadata
    const mimeValid = await verifyMIMEType(buffer, declaredMime);
    if (!mimeValid) {
      await deleteFromS3(uploadId); // Cleanup
      return NextResponse.json(
        {
          error: "MIME type verification failed",
          details: [
            {
              field: "file",
              message: "File header doesn't match declared MIME type",
              code: "MIME_MISMATCH",
            },
          ],
        },
        { status: 400 }
      );
    }

    // Parse metadata from uploadId: "entitySlug__kind__uploadId.upload"
    const keyParts = uploadId.split("__");
    if (keyParts.length < 3) {
      return NextResponse.json({ error: "Invalid upload ID format" }, { status: 400 });
    }

    const entitySlug = keyParts[0];
    const kind = keyParts[1] as MediaKind;

    // Validate image dimensions and aspect ratio
    const imageValidation = await validateImageBuffer(buffer, kind);
    if (!imageValidation.valid) {
      await deleteFromS3(uploadId);
      return NextResponse.json(
        { error: "Validation failed", details: imageValidation.errors },
        { status: 400 }
      );
    }

    // Analyze brand colors (warnings only)
    const brandAnalysis = await analyzeBrandColors(buffer);
    const warnings = brandAnalysis.message ? [brandAnalysis.message] : undefined;

    // Process image: generate derivatives, blurhash, colors
    const processed = await processImage(buffer, entitySlug, kind);

    // Upload original to S3
    await uploadToS3(processed.original.key, buffer, declaredMime);

    // Upload all derivatives to S3
    for (const derivative of processed.sizes) {
      const derivativeBuffer = await generateDerivativeBuffer(
        buffer,
        derivative.width,
        derivative.format
      );
      await uploadToS3(
        derivative.key,
        derivativeBuffer,
        `image/${derivative.format}`
      );
    }

    // Delete temporary upload file
    await deleteFromS3(uploadId);

    // Create ImageAsset record in database
    const imageAsset = await prisma.imageAsset.create({
      data: {
        bucket: process.env.S3_BUCKET_NAME!,
        key: `${entitySlug}__${kind}`, // Base key without size/format
        mime: declaredMime,
        width: processed.original.width,
        height: processed.original.height,
        bytes: processed.original.sizeBytes,
        format: "WEBP", // Default format enum
        blurhash: processed.blurhash,
        avgColor: processed.avgColor,
        alt,
        derivatives: {
          original: processed.original,
          sizes: processed.sizes,
        },
      },
    });

    // Build CDN URL
    const cdnUrl = buildCDNUrl(
      `${entitySlug}__${kind}__1280w.avif`,
      processed.contentHash
    );

    return NextResponse.json(
      {
        imageAsset: {
          id: imageAsset.id,
          key: imageAsset.key,
          width: imageAsset.width,
          height: imageAsset.height,
          blurhash: imageAsset.blurhash,
          avgColor: imageAsset.avgColor,
          derivatives: processed,
          cdnUrl,
        },
        warnings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error completing upload:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
