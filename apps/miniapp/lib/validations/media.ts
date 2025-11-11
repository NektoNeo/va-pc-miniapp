import { z } from "zod";

/**
 * Image format enum для ImageAsset
 */
export const imageFormatEnum = z.enum(["WEBP", "AVIF", "JPEG", "PNG"], {
  required_error: "Выберите формат изображения",
});

/**
 * Допустимые MIME types для upload
 */
export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/**
 * Максимальный размер файла: 10MB
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Размеры для responsive images
 */
export const IMAGE_SIZES = {
  ORIGINAL: "original",
  LARGE: 1920,
  MEDIUM: 1280,
  SMALL: 640,
  THUMBNAIL: 320,
} as const;

/**
 * Zod validation schema для upload FormData
 */
export const mediaUploadSchema = z.object({
  alt: z
    .string()
    .min(1, "Alt текст обязателен для accessibility")
    .max(140, "Максимум 140 символов")
    .trim(),
  format: imageFormatEnum.optional().default("WEBP"),
});

export type MediaUploadData = z.infer<typeof mediaUploadSchema>;

/**
 * Validation для file в multipart/form-data
 */
export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
  // Проверка MIME type
  if (!ALLOWED_IMAGE_MIMES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Неподдерживаемый формат файла. Разрешены: ${ALLOWED_IMAGE_MIMES.join(", ")}`,
    };
  }

  // Проверка размера
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return {
      valid: false,
      error: `Файл слишком большой. Максимум: ${maxMb}MB`,
    };
  }

  // Проверка расширения (дополнительная безопасность)
  const ext = file.name.split(".").pop()?.toLowerCase();
  const validExts = ["jpg", "jpeg", "png", "webp", "avif"];
  if (!ext || !validExts.includes(ext)) {
    return {
      valid: false,
      error: "Неподдерживаемое расширение файла",
    };
  }

  return { valid: true };
}

/**
 * Helper: получить short label для ImageFormat
 */
export function getImageFormatLabel(format: "WEBP" | "AVIF" | "JPEG" | "PNG"): string {
  const labels = {
    WEBP: "WebP",
    AVIF: "AVIF",
    JPEG: "JPEG",
    PNG: "PNG",
  };
  return labels[format];
}

/**
 * Helper: конвертация MIME type → ImageFormat enum
 */
export function mimeToImageFormat(mime: string): "WEBP" | "AVIF" | "JPEG" | "PNG" {
  switch (mime) {
    case "image/webp":
      return "WEBP";
    case "image/avif":
      return "AVIF";
    case "image/png":
      return "PNG";
    case "image/jpeg":
    case "image/jpg":
    default:
      return "JPEG";
  }
}
