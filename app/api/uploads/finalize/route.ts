import { NextResponse } from "next/server";
import { z } from "zod";

import { AdminAuthError, AuthConfigurationError, requireAdminSession } from "@/lib/auth";
import { createMediaAssetRecord } from "@/lib/queries/admin/media";
import {
  buildPublicAssetUrl,
  extractUploadedFileName,
  getUploadedObjectMetadata,
  UploadObjectMetadataError,
  UploadObjectMissingError,
} from "@/lib/storage/r2";

const finalizeUploadSchema = z.object({
  objectKey: z.string().trim().min(1).max(240),
  altText: z.string().trim().max(240).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = finalizeUploadSchema.parse(await request.json());

    const metadata = await getUploadedObjectMetadata(body.objectKey);

    const asset = await createMediaAssetRecord({
      fileName: extractUploadedFileName(body.objectKey),
      mimeType: metadata.contentType,
      byteSize: metadata.byteSize,
      objectKey: body.objectKey,
      publicUrl: buildPublicAssetUrl(body.objectKey),
      altText: body.altText ?? null,
    });

    return NextResponse.json({
      ok: true,
      asset,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }

    if (error instanceof AuthConfigurationError) {
      return NextResponse.json({ ok: false, reason: "auth-not-configured" }, { status: 503 });
    }

    if (error instanceof UploadObjectMissingError) {
      return NextResponse.json({ ok: false, reason: "upload-not-found" }, { status: 409 });
    }

    if (error instanceof UploadObjectMetadataError) {
      return NextResponse.json({ ok: false, reason: "invalid-upload-object" }, { status: 400 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, reason: "invalid-upload-input" }, { status: 400 });
    }

    throw error;
  }
}
