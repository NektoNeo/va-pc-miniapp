/**
 * S3/R2 Storage Operations
 * Upload, download, delete operations with signed URLs
 */

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, getS3Bucket } from "./s3-client";

// ============================================================================
// Upload Operations
// ============================================================================

/**
 * Generate signed URL for direct S3 upload
 * @param key - S3 object key
 * @param contentType - MIME type
 * @param expiresIn - URL expiry in seconds (default: 600 = 10 minutes)
 * @returns Signed PUT URL
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 600
): Promise<string> {
  const client = getS3Client();
  const bucket = getS3Bucket();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Upload buffer directly to S3
 * @param key - S3 object key
 * @param buffer - File buffer
 * @param contentType - MIME type
 * @returns Upload result
 */
export async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<{ key: string; bucket: string }> {
  const client = getS3Client();
  const bucket = getS3Bucket();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: key.includes("original") ? "public, max-age=604800" : "public, max-age=31536000, immutable",
    })
  );

  return { key, bucket };
}

// ============================================================================
// Download Operations
// ============================================================================

/**
 * Download object from S3 as buffer
 * @param key - S3 object key
 * @returns File buffer
 */
export async function downloadFromS3(key: string): Promise<Buffer> {
  const client = getS3Client();
  const bucket = getS3Bucket();

  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error(`Failed to download ${key}: No body in response`);
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

// ============================================================================
// Delete Operations
// ============================================================================

/**
 * Delete object from S3
 * @param key - S3 object key
 */
export async function deleteFromS3(key: string): Promise<void> {
  const client = getS3Client();
  const bucket = getS3Bucket();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/**
 * Delete multiple objects from S3
 * @param keys - Array of S3 object keys
 * @returns Array of successfully deleted keys
 */
export async function deleteMultipleFromS3(keys: string[]): Promise<string[]> {
  const deleted: string[] = [];

  for (const key of keys) {
    try {
      await deleteFromS3(key);
      deleted.push(key);
    } catch (error) {
      console.error(`Failed to delete ${key}:`, error);
    }
  }

  return deleted;
}
