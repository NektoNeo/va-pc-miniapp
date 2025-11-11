import sharp, { Sharp } from "sharp";
import { IMAGE_SIZES } from "../validations/media";

/**
 * Image metadata после обработки
 */
export interface ProcessedImageMetadata {
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}

/**
 * Результат обработки одного размера изображения
 */
export interface ProcessedImage {
  buffer: Buffer;
  metadata: ProcessedImageMetadata;
  suffix: string; // "original", "1920w", "1280w", etc.
}

/**
 * Результат полной обработки изображения (все sizes)
 */
export interface ProcessingResult {
  original: ProcessedImage;
  derivatives: ProcessedImage[];
  rawPixels: {
    data: Uint8ClampedArray;
    width: number;
    height: number;
  };
}

/**
 * Image Processor - pipeline для обработки изображений
 */
export class ImageProcessor {
  /**
   * Обрабатывает изображение: генерирует multiple sizes, converts to WebP
   * @param inputBuffer - Original image buffer
   * @param targetFormat - Target format (webp, avif, jpeg, png)
   * @returns Processing result с original, derivatives, и raw pixels для blurhash
   */
  async process(
    inputBuffer: Buffer,
    targetFormat: "webp" | "avif" | "jpeg" | "png" = "webp"
  ): Promise<ProcessingResult> {
    const sharpInstance = sharp(inputBuffer);

    // Получаем metadata original изображения
    const originalMetadata = await sharpInstance.metadata();

    if (!originalMetadata.width || !originalMetadata.height) {
      throw new Error("Cannot extract image dimensions");
    }

    // Обрабатываем original image (convert to target format)
    const original = await this.processSize(
      sharpInstance,
      IMAGE_SIZES.ORIGINAL,
      targetFormat,
      originalMetadata.width,
      originalMetadata.height
    );

    // Генерируем derivatives (resize to different sizes)
    const derivatives = await this.generateDerivatives(
      inputBuffer,
      targetFormat,
      originalMetadata.width,
      originalMetadata.height
    );

    // Извлекаем raw pixels для blurhash (используем small thumbnail)
    const rawPixels = await this.extractRawPixels(inputBuffer);

    return {
      original,
      derivatives,
      rawPixels,
    };
  }

  /**
   * Обрабатывает один размер изображения
   */
  private async processSize(
    sharpInstance: Sharp,
    size: string | number,
    format: "webp" | "avif" | "jpeg" | "png",
    originalWidth: number,
    originalHeight: number
  ): Promise<ProcessedImage> {
    let pipeline = sharpInstance.clone();

    // Resize если нужен конкретный размер
    if (typeof size === "number") {
      // Resize только если original больше target size
      if (originalWidth > size || originalHeight > size) {
        pipeline = pipeline.resize(size, size, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }
    }

    // Convert to target format
    switch (format) {
      case "webp":
        pipeline = pipeline.webp({ quality: 85, effort: 4 });
        break;
      case "avif":
        pipeline = pipeline.avif({ quality: 70, effort: 4 });
        break;
      case "jpeg":
        pipeline = pipeline.jpeg({ quality: 90, progressive: true });
        break;
      case "png":
        pipeline = pipeline.png({ compressionLevel: 9 });
        break;
    }

    // Process image
    const buffer = await pipeline.toBuffer();
    const metadata = await sharp(buffer).metadata();

    const suffix = typeof size === "number" ? `${size}w` : size;

    return {
      buffer,
      metadata: {
        width: metadata.width!,
        height: metadata.height!,
        format: metadata.format!,
        sizeBytes: buffer.length,
      },
      suffix,
    };
  }

  /**
   * Генерирует все derivative sizes
   */
  private async generateDerivatives(
    inputBuffer: Buffer,
    format: "webp" | "avif" | "jpeg" | "png",
    originalWidth: number,
    originalHeight: number
  ): Promise<ProcessedImage[]> {
    const sharpInstance = sharp(inputBuffer);
    const derivatives: ProcessedImage[] = [];

    const sizes = [IMAGE_SIZES.LARGE, IMAGE_SIZES.MEDIUM, IMAGE_SIZES.SMALL, IMAGE_SIZES.THUMBNAIL];

    for (const size of sizes) {
      // Пропускаем если original меньше этого размера
      if (originalWidth < size && originalHeight < size) {
        continue;
      }

      const processed = await this.processSize(
        sharpInstance,
        size,
        format,
        originalWidth,
        originalHeight
      );
      derivatives.push(processed);
    }

    return derivatives;
  }

  /**
   * Извлекает raw RGBA pixels для blurhash generation
   * Использует small thumbnail (32x32) для производительности
   */
  private async extractRawPixels(
    inputBuffer: Buffer
  ): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
    const thumbnailSize = 32;

    const { data, info } = await sharp(inputBuffer)
      .resize(thumbnailSize, thumbnailSize, {
        fit: "cover",
      })
      .ensureAlpha() // RGBA format
      .raw()
      .toBuffer({ resolveWithObject: true });

    return {
      data: new Uint8ClampedArray(data),
      width: info.width,
      height: info.height,
    };
  }

  /**
   * Extract average color from image
   * @returns Hex color string (e.g., "#FF5733")
   */
  async extractAverageColor(inputBuffer: Buffer): Promise<string> {
    const { data } = await sharp(inputBuffer)
      .resize(1, 1, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const r = data[0];
    const g = data[1];
    const b = data[2];

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
}
