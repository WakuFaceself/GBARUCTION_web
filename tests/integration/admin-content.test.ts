import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  hasDatabaseUrl: () => false,
  env: {},
}));

import { saveAdminContentRecord, type AdminContentType } from "@/lib/queries/admin/content";
import { createMediaAssetRecord } from "@/lib/queries/admin/media";

describe("admin content validation", () => {
  beforeEach(() => {
    globalThis.__gbaructionAdminStore = undefined;
    globalThis.__gbaructionMediaStore = undefined;
  });

  it("rejects duplicate slugs inside the same collection", async () => {
    await expect(
      saveAdminContentRecord({
        type: "recommendations",
        status: "draft",
        fields: {
          slug: "midnight-drive",
          titleZh: "重复条目",
          titleEn: "Duplicate Entry",
          summaryZh: "",
          summaryEn: "",
          bodyLanguage: "zh",
          bodyBlocks: '[{"id":"body-intro","type":"richText","data":{"content":"dup"}}]',
        },
      }),
    ).rejects.toMatchObject({ code: "slug-conflict" });
  });

  it("stores a selected cover asset on content records", async () => {
    const asset = await createMediaAssetRecord({
      kind: "cover",
      fileName: "cover.jpg",
      mimeType: "image/jpeg",
      byteSize: 1024,
      objectKey: "covers/cover.jpg",
      publicUrl: "https://cdn.example.com/cover.jpg",
    });

    const record = await saveAdminContentRecord({
      type: "interviews" satisfies AdminContentType,
      status: "draft",
      fields: {
        slug: "new-interview-with-cover",
        titleZh: "带封面的采访",
        titleEn: "Interview with Cover",
        summaryZh: "",
        summaryEn: "",
        relatedEntityTextZh: "",
        relatedEntityTextEn: "",
        coverAssetId: asset.id,
        bodyLanguage: "zh",
        bodyBlocks: '[{"id":"body-intro","type":"richText","data":{"content":"covered"}}]',
      },
    });

    expect(record.fields.coverAssetId).toBe(asset.id);
  });

  it("rejects a missing cover asset id", async () => {
    await expect(
      saveAdminContentRecord({
        type: "shows",
        status: "draft",
        fields: {
          slug: "show-with-missing-cover",
          titleZh: "缺失封面",
          titleEn: "Missing Cover",
          summaryZh: "",
          summaryEn: "",
          startsAt: "2026-04-20T20:00",
          venue: "Venue",
          city: "Shanghai",
          lineupTextZh: "",
          lineupTextEn: "",
          coverAssetId: "missing-asset-id",
          bodyLanguage: "zh",
          bodyBlocks: '[{"id":"body-intro","type":"richText","data":{"content":"covered"}}]',
        },
      }),
    ).rejects.toMatchObject({ code: "invalid-cover-asset" });
  });

  it("rejects malformed body blocks input", async () => {
    await expect(
      saveAdminContentRecord({
        type: "pages",
        status: "draft",
        fields: {
          slug: "bad-body",
          titleZh: "坏正文",
          titleEn: "Bad Body",
          summaryZh: "",
          summaryEn: "",
          bodyLanguage: "zh",
          bodyBlocks: "{not-json}",
        },
      }),
    ).rejects.toMatchObject({ code: "invalid-body-blocks" });
  });
});
