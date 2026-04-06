import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/env";

export class UploadObjectMissingError extends Error {
  constructor(objectKey: string) {
    super(`Uploaded object does not exist yet: ${objectKey}`);
    this.name = "UploadObjectMissingError";
  }
}

export class UploadObjectMetadataError extends Error {
  constructor(objectKey: string) {
    super(`Uploaded object metadata is incomplete or invalid: ${objectKey}`);
    this.name = "UploadObjectMetadataError";
  }
}

function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: env.R2_ACCOUNT_ID
      ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : undefined,
    credentials:
      env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

export async function createUploadUrl(objectKey: string, contentType: string) {
  const client = createR2Client();
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: objectKey,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: 60 * 5 });
}

export async function createReadUrl(objectKey: string) {
  const client = createR2Client();
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: objectKey,
  });

  return getSignedUrl(client, command, { expiresIn: 60 * 5 });
}

export async function getUploadedObjectMetadata(objectKey: string) {
  const client = createR2Client();
  const command = new HeadObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: objectKey,
  });

  try {
    const response = await client.send(command);
    const contentType = response.ContentType;
    const byteSize = response.ContentLength;

    if (
      !contentType ||
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(contentType) ||
      typeof byteSize !== "number" ||
      !Number.isFinite(byteSize) ||
      byteSize < 1 ||
      byteSize > 10 * 1024 * 1024
    ) {
      throw new UploadObjectMetadataError(objectKey);
    }

    return {
      contentType,
      byteSize,
    };
  } catch (error) {
    if (error instanceof UploadObjectMetadataError) {
      throw error;
    }

    throw new UploadObjectMissingError(objectKey);
  }
}

export function extractUploadedFileName(objectKey: string) {
  const lastSegment = objectKey.split("/").at(-1) ?? objectKey;
  const dashIndex = lastSegment.indexOf("-");
  const fileName = dashIndex >= 0 ? lastSegment.slice(dashIndex + 1) : lastSegment;

  return fileName || "upload";
}

export function buildPublicAssetUrl(objectKey: string) {
  if (!env.R2_PUBLIC_URL) {
    return null;
  }

  return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${objectKey}`;
}
