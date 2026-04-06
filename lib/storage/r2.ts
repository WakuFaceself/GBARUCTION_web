import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/env";

export class UploadObjectMissingError extends Error {
  constructor(objectKey: string) {
    super(`Uploaded object does not exist yet: ${objectKey}`);
    this.name = "UploadObjectMissingError";
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

export async function assertObjectExists(objectKey: string) {
  const client = createR2Client();
  const command = new HeadObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: objectKey,
  });

  try {
    await client.send(command);
  } catch {
    throw new UploadObjectMissingError(objectKey);
  }
}

export function buildPublicAssetUrl(objectKey: string) {
  if (!env.R2_PUBLIC_URL) {
    return null;
  }

  return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${objectKey}`;
}
