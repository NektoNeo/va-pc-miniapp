import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { StorageProvider } from "./storage-provider";

/**
 * S3StorageProvider - хранение файлов в S3-compatible storage
 * Поддерживает AWS S3, CloudFlare R2, MinIO, и другие S3-совместимые сервисы
 */
export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl?: string;

  constructor(config: {
    bucket: string;
    region: string;
    endpoint?: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicUrl?: string;
  }) {
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;

    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(key: string, buffer: Buffer, mime: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mime,
      ACL: "public-read", // Файлы доступны публично
    });

    await this.client.send(command);

    // Возвращаем public URL
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }

    // Default S3 URL если custom URL не указан
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    });

    await this.client.send(command);
  }

  getBucket(): string {
    return this.bucket;
  }
}
