import { NextResponse } from "next/server";

import { AdminAuthError, requireAdminSession } from "@/lib/auth";
import { createUploadUrl } from "@/lib/storage/r2";

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = (await request.json()) as {
      fileName: string;
      contentType: string;
    };

    const objectKey = `uploads/${Date.now()}-${body.fileName}`;
    const uploadUrl = await createUploadUrl(objectKey, body.contentType);

    return NextResponse.json({
      ok: true,
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
