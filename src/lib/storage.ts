/**
 * File storage service
 * Supports AWS S3 and Cloudflare R2
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface StorageConfig {
  provider: "s3" | "r2" | "local";
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket?: string;
  region?: string;
  endpoint?: string;
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (s3Client) {
    return s3Client;
  }

  const config: StorageConfig = {
    provider: (process.env.STORAGE_PROVIDER as any) || "local",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET || process.env.R2_BUCKET,
    region: process.env.AWS_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT || process.env.S3_ENDPOINT,
  };

  if (config.provider === "local" || !config.accessKeyId || !config.secretAccessKey) {
    return null;
  }

  s3Client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
    forcePathStyle: config.provider === "r2", // R2 requires path-style
  });

  return s3Client;
}

/**
 * Upload file to storage
 */
export async function uploadFile(
  key: string,
  file: Buffer | Uint8Array,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  const client = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET || process.env.R2_BUCKET;

  if (!client || !bucket) {
    // In development, save to local filesystem or return a placeholder
    if (process.env.NODE_ENV === "development") {
      console.log("File upload (stubbed):", { key, contentType, size: file.length });
      return `/uploads/${key}`;
    }
    throw new Error("Storage not configured");
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: metadata,
  });

  await client.send(command);

  // Return public URL or signed URL
  if (process.env.STORAGE_PUBLIC_URL) {
    return `${process.env.STORAGE_PUBLIC_URL}/${key}`;
  }

  return key;
}

/**
 * Get file URL (signed if private)
 */
export async function getFileUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET || process.env.R2_BUCKET;

  if (!client || !bucket) {
    return `/uploads/${key}`;
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(client, command, { expiresIn });
  return url;
}

/**
 * Delete file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET || process.env.R2_BUCKET;

  if (!client || !bucket) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
}

/**
 * Generate storage key for user uploads
 */
export function generateStorageKey(
  userId: string,
  fileName: string,
  folder: string = "uploads"
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${folder}/${userId}/${timestamp}-${sanitizedFileName}`;
}

