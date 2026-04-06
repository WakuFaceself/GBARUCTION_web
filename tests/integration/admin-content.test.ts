import { beforeEach, describe, expect, it, vi } from "vitest";

import { recommendations } from "@/lib/db/schema/content";

const { hasDatabaseUrlMock, createDbMock, updateSetMock } = vi.hoisted(() => {
  const hasDatabaseUrlMock = vi.fn(() => false);
  const updateSetMock = vi.fn();
  const existingRecommendationRow = {
    id: "existing-published-record",
    slug: "midnight-drive",
    status: "published",
    titleZh: "午夜公路",
    titleEn: "Midnight Drive",
    summaryZh: "一张适合夜行的合成器推荐。",
    summaryEn: "A synth-heavy recommendation for late-night driving.",
    bodyBlocks: [{ id: "body-intro", type: "richText", data: { content: "old" } }],
    bodyLanguage: "zh",
    subjectName: "Neon Pulse",
    embedProvider: null,
    embedUrl: null,
    externalLinks: [],
    coverAssetId: null,
    seoTitleZh: null,
    seoTitleEn: null,
    seoDescriptionZh: null,
    seoDescriptionEn: null,
    publishedAt: new Date("2026-04-02T08:00:00.000Z"),
    updatedAt: new Date("2026-04-03T08:00:00.000Z"),
  };
  const dbMock = {
    select: vi.fn((selection?: Record<string, unknown>) => {
      if (selection && "contentId" in selection) {
        return {
          from: vi.fn(() => ({
            innerJoin: vi.fn(() => ({
              where: vi.fn(async () => []),
            })),
          })),
        };
      }

      return {
        from: vi.fn((table: unknown) => {
          if (table === recommendations) {
            return {
              where: vi.fn(async () => [existingRecommendationRow]),
            };
          }

          return {
            where: vi.fn(async () => []),
          };
        }),
      };
    }),
    update: vi.fn(() => ({
      set: updateSetMock,
    })),
    delete: vi.fn(() => ({
      where: vi.fn(async () => undefined),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(async () => [{ id: "new-record" }]),
      })),
    })),
  };

  const createDbMock = vi.fn(() => dbMock);

  return { hasDatabaseUrlMock, createDbMock, updateSetMock };
});

vi.mock("@/lib/env", () => ({
  hasDatabaseUrl: hasDatabaseUrlMock,
  env: {},
}));

vi.mock("@/lib/db/client", () => ({
  createDb: createDbMock,
}));

import { saveAdminContentRecord, type AdminContentType } from "@/lib/queries/admin/content";
import { createMediaAssetRecord } from "@/lib/queries/admin/media";

describe("admin content validation", () => {
  beforeEach(() => {
    hasDatabaseUrlMock.mockReturnValue(false);
    createDbMock.mockClear();
    updateSetMock.mockClear();
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

  it("preserves an existing publishedAt when republishing an edited record", async () => {
    hasDatabaseUrlMock.mockReturnValue(true);

    updateSetMock.mockImplementation((values: Record<string, unknown>) => ({
      where: vi.fn(() => ({
        returning: vi.fn(async () => [
          {
            id: "existing-published-record",
            slug: values.slug,
            status: values.status,
            publishedAt: values.publishedAt,
          },
        ]),
      })),
    }));

    const record = await saveAdminContentRecord({
      type: "recommendations",
      id: "existing-published-record",
      status: "published",
      fields: {
        slug: "midnight-drive",
        titleZh: "午夜公路（更新）",
        titleEn: "Midnight Drive Updated",
        summaryZh: "更新后的摘要。",
        summaryEn: "Updated summary.",
        subjectName: "Neon Pulse",
        bodyLanguage: "zh",
        bodyBlocks: '[{"id":"body-intro","type":"richText","data":{"content":"updated"}}]',
      },
    });

    expect(updateSetMock).toHaveBeenCalledTimes(1);
    expect(updateSetMock.mock.calls[0]?.[0]).toMatchObject({
      publishedAt: new Date("2026-04-02T08:00:00.000Z"),
      status: "published",
      slug: "midnight-drive",
    });
    expect(record.publishedAt).toBe("2026-04-02T08:00:00.000Z");
  });
});
