import { NextResponse } from "next/server";
import { z } from "zod";

import { AdminAuthError, AuthConfigurationError, requireAdminSession } from "@/lib/auth";
import { createMediaAssetRecord } from "@/lib/queries/admin/media";
import { createUploadUrl } from "@/lib/storage/r2";

const uploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-zA-Z0-9._-]+$/, "Only simple file names are allowed."),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  byteSize: z.number().int().min(1).max(10 * 1024 * 1024).optional(),
  altText: z.string().trim().max(240).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = uploadSchema.parse(await request.json());

    const objectKey = `uploads/${Date.now()}-${body.fileName}`;
    const uploadUrl = await createUploadUrl(objectKey, body.contentType);
    const asset = await createMediaAssetRecord({
      fileName: body.fileName,
      mimeType: body.contentType,
      byteSize: body.byteSize ?? 0,
      objectKey,
      altText: body.altText ?? null,
    });

    return NextResponse.json({
      ok: true,
      asset,
      objectKey,
      uploadUrl,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }

    if (error instanceof AuthConfigurationError) {
      return NextResponse.json({ ok: false, reason: "auth-not-configured" }, { status: 503 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, reason: "invalid-upload-input" }, { status: 400 });
    }

    throw error;
  }
}
