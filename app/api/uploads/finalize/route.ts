import { NextResponse } from "next/server";
import { z } from "zod";

import { AdminAuthError, AuthConfigurationError, requireAdminSession } from "@/lib/auth";
import { createMediaAssetRecord } from "@/lib/queries/admin/media";
import { assertObjectExists, buildPublicAssetUrl, UploadObjectMissingError } from "@/lib/storage/r2";

const finalizeUploadSchema = z.object({
  objectKey: z.string().trim().min(1).max(240),
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-zA-Z0-9._-]+$/, "Only simple file names are allowed."),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  byteSize: z.number().int().min(1).max(10 * 1024 * 1024),
  altText: z.string().trim().max(240).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = finalizeUploadSchema.parse(await request.json());

    await assertObjectExists(body.objectKey);

    const asset = await createMediaAssetRecord({
      fileName: body.fileName,
      mimeType: body.contentType,
      byteSize: body.byteSize,
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

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, reason: "invalid-upload-input" }, { status: 400 });
    }

    throw error;
  }
}
