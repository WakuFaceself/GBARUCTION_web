import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth";
import { createUploadUrl } from "@/lib/storage/r2";

export async function POST(request: Request) {
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
}
