import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStorageProvider } from "@/lib/storage";
import { ImageProcessor } from "@/lib/media/image-processor";
import { BlurhashGenerator } from "@/lib/media/blurhash-generator";
import {
  validateUploadedFile,
  mediaUploadSchema,
  mimeToImageFormat,
} from "@/lib/validations/media";
import { randomUUID } from "crypto";

/**
 * POST /api/admin/media - Upload new image
 */
export async function POST(request: NextRequest) {
  try {
    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = formData.get("alt") as string | null;
    const formatPref = formData.get("format") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не предоставлен" }, { status: 400 });
    }

    // Validate file
    const fileValidation = validateUploadedFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Validate alt text
    const validationResult = mediaUploadSchema.safeParse({
      alt: altText,
      format: formatPref || "WEBP",
    });

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { alt, format } = validationResult.data;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image
    const processor = new ImageProcessor();
    const targetFormat = format.toLowerCase() as "webp" | "avif" | "jpeg" | "png";
    const processingResult = await processor.process(buffer, targetFormat);

    // Generate blurhash
    const blurhashGen = new BlurhashGenerator();
    const blurhash = blurhashGen.encode(
      processingResult.rawPixels.data,
      processingResult.rawPixels.width,
      processingResult.rawPixels.height
    );

    // Extract average color
    const avgColor = await processor.extractAverageColor(buffer);

    // Generate unique key (base key without suffix)
    const baseKey = randomUUID();

    // Upload files to storage
    const storage = getStorageProvider();
    const uploadPromises: Promise<string>[] = [];
    const derivativesMetadata: any[] = [];

    // Upload original
    const originalKey = `${baseKey}__original.${targetFormat}`;
    uploadPromises.push(
      storage.upload(originalKey, processingResult.original.buffer, file.type)
    );

    // Upload derivatives
    for (const derivative of processingResult.derivatives) {
      const derivativeKey = `${baseKey}__${derivative.suffix}.${targetFormat}`;
      uploadPromises.push(storage.upload(derivativeKey, derivative.buffer, file.type));

      derivativesMetadata.push({
        key: derivativeKey,
        width: derivative.metadata.width,
        height: derivative.metadata.height,
        sizeBytes: derivative.metadata.sizeBytes,
        format: derivative.metadata.format,
        suffix: derivative.suffix,
      });
    }

    // Wait for all uploads
    await Promise.all(uploadPromises);

    // Create ImageAsset record
    const imageAsset = await db.imageAsset.create({
      data: {
        bucket: storage.getBucket(),
        key: baseKey,
        mime: file.type,
        width: processingResult.original.metadata.width,
        height: processingResult.original.metadata.height,
        bytes: processingResult.original.metadata.sizeBytes,
        format: format,
        blurhash,
        avgColor,
        alt,
        derivatives: {
          original: {
            key: originalKey,
            width: processingResult.original.metadata.width,
            height: processingResult.original.metadata.height,
            sizeBytes: processingResult.original.metadata.sizeBytes,
          },
          sizes: derivativesMetadata,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: imageAsset,
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке изображения" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/media - List all images with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const format = searchParams.get("format") || undefined;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (format) {
      where.format = format;
    }

    // Fetch images with pagination
    const [images, total] = await Promise.all([
      db.imageAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.imageAsset.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении списка изображений" },
      { status: 500 }
    );
  }
}
