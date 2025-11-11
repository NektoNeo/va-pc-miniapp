import { StorageProvider, StorageConfig } from "./storage-provider";
import { LocalStorageProvider } from "./local-storage";
import { S3StorageProvider } from "./s3-storage";

/**
 * Factory function - создает StorageProvider на основе конфигурации
 */
export function createStorageProvider(config: StorageConfig): StorageProvider {
  if (config.type === "local") {
    return new LocalStorageProvider({
      publicDir: config.publicDir,
      publicUrl: config.publicUrl,
    });
  }

  if (config.type === "s3") {
    return new S3StorageProvider({
      bucket: config.bucket,
      region: config.region,
      endpoint: config.endpoint,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      publicUrl: config.publicUrl,
    });
  }

  throw new Error(`Unknown storage type: ${(config as any).type}`);
}

/**
 * Get configured storage provider
 * Использует environment variables для определения типа storage
 */
export function getStorageProvider(): StorageProvider {
  const storageType = process.env.STORAGE_TYPE || "local";

  if (storageType === "s3") {
    // Production S3 configuration
    const config: StorageConfig = {
      type: "s3",
      bucket: process.env.S3_BUCKET!,
      region: process.env.S3_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT, // CloudFlare R2, etc.
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      publicUrl: process.env.S3_PUBLIC_URL, // Custom CDN URL
    };

    if (!config.bucket || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error(
        "S3 configuration missing: S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY required"
      );
    }

    return createStorageProvider(config);
  }

  // Development local storage
  const config: StorageConfig = {
    type: "local",
    publicDir: "public/uploads",
    publicUrl: "/uploads",
  };

  return createStorageProvider(config);
}

// Re-export types
export type { StorageProvider, StorageConfig };
