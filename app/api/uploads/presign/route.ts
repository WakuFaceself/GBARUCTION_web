import { NextResponse } from "next/server";

import { AdminAuthError, requireAdminSession } from "@/lib/auth";
import { createMediaAssetRecord } from "@/lib/queries/admin/media";
import { createUploadUrl } from "@/lib/storage/r2";

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = (await request.json()) as {
      fileName: string;
      contentType: string;
      byteSize?: number;
      altText?: string;
    };

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

    throw error;
  }
}
