import fs from "fs/promises";
import path from "path";
import { StorageProvider } from "./storage-provider";

/**
 * LocalStorageProvider - хранение файлов в local filesystem
 * Используется для development environment
 */
export class LocalStorageProvider implements StorageProvider {
  private publicDir: string;
  private publicUrl: string;
  private bucket = "local";

  constructor(config: { publicDir: string; publicUrl: string }) {
    this.publicDir = config.publicDir;
    this.publicUrl = config.publicUrl;
  }

  async upload(key: string, buffer: Buffer, mime: string): Promise<string> {
    // Создаем директорию если не существует
    const fullPath = path.join(process.cwd(), this.publicDir);
    await fs.mkdir(fullPath, { recursive: true });

    // Сохраняем файл
    const filePath = path.join(fullPath, key);
    await fs.writeFile(filePath, buffer);

    // Возвращаем public URL
    return `${this.publicUrl}/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(process.cwd(), this.publicDir, key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Игнорируем ошибку если файл не существует
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.delete(key)));
  }

  getBucket(): string {
    return this.bucket;
  }
}
