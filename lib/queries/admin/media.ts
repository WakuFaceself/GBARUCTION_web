import { randomUUID } from "node:crypto";

import { desc } from "drizzle-orm";

import { createDb } from "@/lib/db/client";
import { mediaAssets } from "@/lib/db/schema/media";
import { hasDatabaseUrl } from "@/lib/env";

export type AdminMediaAsset = {
  id: string;
  kind: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  objectKey: string;
  publicUrl: string | null;
  altText: string | null;
  createdAt: string;
};

type MemoryMediaStore = {
  assets: AdminMediaAsset[];
};

declare global {
  var __gbaructionMediaStore: MemoryMediaStore | undefined;
}

function getMemoryStore() {
  if (!globalThis.__gbaructionMediaStore) {
    globalThis.__gbaructionMediaStore = {
      assets: [],
    };
  }

  return globalThis.__gbaructionMediaStore;
}

export async function listMediaAssets(): Promise<AdminMediaAsset[]> {
  if (hasDatabaseUrl()) {
    const db = createDb();
    const rows = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      fileName: row.fileName,
      mimeType: row.mimeType,
      byteSize: row.byteSize,
      objectKey: row.objectKey,
      publicUrl: row.publicUrl,
      altText: row.altText,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  return getMemoryStore().assets.slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function createMediaAssetRecord(input: {
  kind?: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  objectKey: string;
  publicUrl?: string | null;
  altText?: string | null;
}) {
  if (hasDatabaseUrl()) {
    const db = createDb();
    const [row] = await db
      .insert(mediaAssets)
      .values({
        kind: input.kind ?? "image",
        fileName: input.fileName,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        objectKey: input.objectKey,
        publicUrl: input.publicUrl ?? null,
        altText: input.altText ?? null,
      })
      .returning();

    return {
      id: row.id,
      kind: row.kind,
      fileName: row.fileName,
      mimeType: row.mimeType,
      byteSize: row.byteSize,
      objectKey: row.objectKey,
      publicUrl: row.publicUrl,
      altText: row.altText,
      createdAt: row.createdAt.toISOString(),
    } satisfies AdminMediaAsset;
  }

  const asset: AdminMediaAsset = {
    id: randomUUID(),
    kind: input.kind ?? "image",
    fileName: input.fileName,
    mimeType: input.mimeType,
    byteSize: input.byteSize,
    objectKey: input.objectKey,
    publicUrl: input.publicUrl ?? null,
    altText: input.altText ?? null,
    createdAt: new Date().toISOString(),
  };

  getMemoryStore().assets.unshift(asset);
  return asset;
}
