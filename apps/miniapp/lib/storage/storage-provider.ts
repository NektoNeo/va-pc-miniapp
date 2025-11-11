/**
 * Storage Provider Interface
 * Абстракция для хранения медиа-файлов (local filesystem или S3-compatible storage)
 */

export interface StorageProvider {
  /**
   * Upload file to storage
   * @param key - Object key (filename без bucket prefix): "abc123__1920w.webp"
   * @param buffer - File buffer
   * @param mime - MIME type для Content-Type header
   * @returns Public URL для доступа к файлу
   */
  upload(key: string, buffer: Buffer, mime: string): Promise<string>;

  /**
   * Delete file from storage
   * @param key - Object key для удаления
   */
  delete(key: string): Promise<void>;

  /**
   * Delete multiple files (bulk operation)
   * @param keys - Array of object keys
   */
  deleteMany(keys: string[]): Promise<void>;

  /**
   * Get bucket name
   */
  getBucket(): string;
}

/**
 * Storage configuration type
 */
export type StorageConfig =
  | {
      type: "local";
      publicDir: string; // "public/uploads"
      publicUrl: string; // "/uploads"
    }
  | {
      type: "s3";
      bucket: string;
      region: string;
      endpoint?: string; // CloudFlare R2, MinIO, etc.
      accessKeyId: string;
      secretAccessKey: string;
      publicUrl?: string; // Custom CDN URL
    };
