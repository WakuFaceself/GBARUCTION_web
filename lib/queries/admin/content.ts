import { randomUUID } from "node:crypto";

import { and, desc, eq, inArray } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { bodyBlocksSchema } from "@/lib/blocks/schema";
import { createDb } from "@/lib/db/client";
import {
  contentTagLinks,
  interviews,
  pages,
  recommendations,
  shows,
  tags,
} from "@/lib/db/schema/content";
import { hasDatabaseUrl } from "@/lib/env";

export type AdminContentType = "recommendations" | "shows" | "interviews" | "pages";
export type AdminContentStatus = "draft" | "published" | "archived";

export type AdminFieldKind = "text" | "textarea" | "datetime" | "url" | "select";

export type AdminFieldDefinition = {
  name: string;
  label: string;
  kind: AdminFieldKind;
  defaultValue?: string;
  helpText?: string;
  options?: string[];
};

export type AdminContentRecord = {
  id: string;
  type: AdminContentType;
  slug: string;
  status: AdminContentStatus;
  title: string;
  summary: string;
  updatedAt: string;
  publishedAt: string | null;
  fields: Record<string, string>;
};

export type AdminCollectionConfig = {
  type: AdminContentType;
  label: string;
  singularLabel: string;
  description: string;
  newLabel: string;
  fields: AdminFieldDefinition[];
};

type AdminStore = {
  records: Record<AdminContentType, AdminContentRecord[]>;
};

type RecommendationRow = InferSelectModel<typeof recommendations>;
type ShowRow = InferSelectModel<typeof shows>;
type InterviewRow = InferSelectModel<typeof interviews>;
type PageRow = InferSelectModel<typeof pages>;

const collectionConfigs = {
  recommendations: {
    type: "recommendations",
    label: "Recommendations",
    singularLabel: "Recommendation",
    description: "Single-track recommendations, listening notes, and embedded links.",
    newLabel: "New recommendation",
    fields: [
      { name: "slug", label: "Slug", kind: "text", defaultValue: "new-recommendation" },
      { name: "titleZh", label: "Title zh", kind: "text" },
      { name: "titleEn", label: "Title en", kind: "text" },
      { name: "summaryZh", label: "Summary zh", kind: "textarea" },
      { name: "summaryEn", label: "Summary en", kind: "textarea" },
      { name: "tags", label: "Tags", kind: "textarea", helpText: "Comma or line-separated labels." },
      { name: "subjectName", label: "Subject name", kind: "text" },
      {
        name: "bodyLanguage",
        label: "Body language",
        kind: "select",
        defaultValue: "zh",
        options: ["zh", "en"],
      },
      { name: "embedProvider", label: "Embed provider", kind: "text" },
      { name: "embedUrl", label: "Embed URL", kind: "url" },
      {
        name: "externalLinks",
        label: "External links",
        kind: "textarea",
        helpText: "One per line. Use Label|https://example.com or just a URL.",
      },
      { name: "seoTitleZh", label: "SEO title zh", kind: "text" },
      { name: "seoTitleEn", label: "SEO title en", kind: "text" },
      { name: "seoDescriptionZh", label: "SEO description zh", kind: "textarea" },
      { name: "seoDescriptionEn", label: "SEO description en", kind: "textarea" },
    ],
  },
  shows: {
    type: "shows",
    label: "Shows",
    singularLabel: "Show",
    description: "Event listings, lineup notes, and ticket links.",
    newLabel: "New show",
    fields: [
      { name: "slug", label: "Slug", kind: "text", defaultValue: "new-show" },
      { name: "titleZh", label: "Title zh", kind: "text" },
      { name: "titleEn", label: "Title en", kind: "text" },
      { name: "summaryZh", label: "Summary zh", kind: "textarea" },
      { name: "summaryEn", label: "Summary en", kind: "textarea" },
      { name: "tags", label: "Tags", kind: "textarea", helpText: "Comma or line-separated labels." },
      { name: "startsAt", label: "Starts at", kind: "datetime" },
      { name: "venue", label: "Venue", kind: "text" },
      { name: "city", label: "City", kind: "text" },
      { name: "lineupTextZh", label: "Lineup zh", kind: "textarea" },
      { name: "lineupTextEn", label: "Lineup en", kind: "textarea" },
      { name: "ticketUrl", label: "Ticket URL", kind: "url" },
      {
        name: "bodyLanguage",
        label: "Body language",
        kind: "select",
        defaultValue: "zh",
        options: ["zh", "en"],
      },
      { name: "seoTitleZh", label: "SEO title zh", kind: "text" },
      { name: "seoTitleEn", label: "SEO title en", kind: "text" },
      { name: "seoDescriptionZh", label: "SEO description zh", kind: "textarea" },
      { name: "seoDescriptionEn", label: "SEO description en", kind: "textarea" },
    ],
  },
  interviews: {
    type: "interviews",
    label: "Interviews",
    singularLabel: "Interview",
    description: "Artist interviews, transcripts, and supporting context.",
    newLabel: "New interview",
    fields: [
      { name: "slug", label: "Slug", kind: "text", defaultValue: "new-interview" },
      { name: "titleZh", label: "Title zh", kind: "text" },
      { name: "titleEn", label: "Title en", kind: "text" },
      { name: "summaryZh", label: "Summary zh", kind: "textarea" },
      { name: "summaryEn", label: "Summary en", kind: "textarea" },
      { name: "tags", label: "Tags", kind: "textarea", helpText: "Comma or line-separated labels." },
      { name: "relatedEntityTextZh", label: "Related entity zh", kind: "text" },
      { name: "relatedEntityTextEn", label: "Related entity en", kind: "text" },
      {
        name: "bodyLanguage",
        label: "Body language",
        kind: "select",
        defaultValue: "zh",
        options: ["zh", "en"],
      },
      { name: "seoTitleZh", label: "SEO title zh", kind: "text" },
      { name: "seoTitleEn", label: "SEO title en", kind: "text" },
      { name: "seoDescriptionZh", label: "SEO description zh", kind: "textarea" },
      { name: "seoDescriptionEn", label: "SEO description en", kind: "textarea" },
    ],
  },
  pages: {
    type: "pages",
    label: "Pages",
    singularLabel: "Page",
    description: "Static editorial pages and evergreen information.",
    newLabel: "New page",
    fields: [
      { name: "slug", label: "Slug", kind: "text", defaultValue: "new-page" },
      { name: "titleZh", label: "Title zh", kind: "text" },
      { name: "titleEn", label: "Title en", kind: "text" },
      { name: "summaryZh", label: "Summary zh", kind: "textarea" },
      { name: "summaryEn", label: "Summary en", kind: "textarea" },
      { name: "tags", label: "Tags", kind: "textarea", helpText: "Comma or line-separated labels." },
      {
        name: "bodyLanguage",
        label: "Body language",
        kind: "select",
        defaultValue: "zh",
        options: ["zh", "en"],
      },
      { name: "seoTitleZh", label: "SEO title zh", kind: "text" },
      { name: "seoTitleEn", label: "SEO title en", kind: "text" },
      { name: "seoDescriptionZh", label: "SEO description zh", kind: "textarea" },
      { name: "seoDescriptionEn", label: "SEO description en", kind: "textarea" },
    ],
  },
} satisfies Record<AdminContentType, AdminCollectionConfig>;

const seedRecords: AdminStore["records"] = {
  recommendations: [
    makeSeedRecord("recommendations", {
      slug: "midnight-drive",
      status: "published",
      titleZh: "午夜公路",
      titleEn: "Midnight Drive",
      summaryZh: "一张适合夜行的合成器推荐。",
      summaryEn: "A synth-heavy recommendation for late-night driving.",
      tags: "synth, night drive",
      subjectName: "Neon Pulse",
      bodyLanguage: "zh",
      bodyBlocks: defaultBodyBlocksString("午夜公路的推荐正文。"),
    }),
    makeSeedRecord("recommendations", {
      slug: "small-room-notes",
      status: "draft",
      titleZh: "小房间笔记",
      titleEn: "Small Room Notes",
      summaryZh: "从密闭空间里长出来的声音。",
      summaryEn: "A note from the smallest room in the building.",
      tags: "room, sketch",
      subjectName: "Room Tone",
      bodyLanguage: "en",
      bodyBlocks: defaultBodyBlocksString("A smaller English body for the draft recommendation."),
    }),
  ],
  shows: [
    makeSeedRecord("shows", {
      slug: "spring-circuit",
      status: "published",
      titleZh: "春季电路巡演",
      titleEn: "Spring Circuit",
      summaryZh: "三城联动的现场系列。",
      summaryEn: "A three-city live run.",
      tags: "live, spring",
      startsAt: "2026-04-18T20:00",
      venue: "Temple Hall",
      city: "Shanghai",
      lineupTextZh: "Opening set / Main act / Afterparty",
      lineupTextEn: "Opening set / Main act / Afterparty",
      bodyLanguage: "zh",
      bodyBlocks: defaultBodyBlocksString("春季电路巡演的现场正文。"),
    }),
    makeSeedRecord("shows", {
      slug: "warehouse-loop",
      status: "draft",
      titleZh: "仓库回路",
      titleEn: "Warehouse Loop",
      summaryZh: "尚未公开的深夜现场。",
      summaryEn: "A late-night booking still under wraps.",
      tags: "warehouse, draft",
      startsAt: "2026-05-02T21:30",
      venue: "Warehouse 9",
      city: "Hangzhou",
      lineupTextZh: "TBA",
      lineupTextEn: "TBA",
      bodyLanguage: "en",
      bodyBlocks: defaultBodyBlocksString("Warehouse Loop draft body."),
    }),
  ],
  interviews: [
    makeSeedRecord("interviews", {
      slug: "signal-from-the-drummer",
      status: "published",
      titleZh: "来自鼓手的信号",
      titleEn: "Signal from the Drummer",
      summaryZh: "一次关于节奏和留白的长谈。",
      summaryEn: "A long conversation about rhythm and negative space.",
      tags: "conversation, drums",
      relatedEntityTextZh: "Drum Circle",
      relatedEntityTextEn: "Drum Circle",
      bodyLanguage: "zh",
      bodyBlocks: defaultBodyBlocksString("关于鼓手和节奏的采访正文。"),
    }),
    makeSeedRecord("interviews", {
      slug: "after-the-set",
      status: "draft",
      titleZh: "演出之后",
      titleEn: "After the Set",
      summaryZh: "编辑中的口述记录。",
      summaryEn: "An oral history still being edited.",
      tags: "oral history",
      relatedEntityTextZh: "Set List",
      relatedEntityTextEn: "Set List",
      bodyLanguage: "en",
      bodyBlocks: defaultBodyBlocksString("Draft interview body."),
    }),
  ],
  pages: [
    makeSeedRecord("pages", {
      slug: "about",
      status: "published",
      titleZh: "关于我们",
      titleEn: "About",
      summaryZh: "编辑部、方法与联系信息。",
      summaryEn: "Editorial process, method, and contact info.",
      tags: "info",
      bodyLanguage: "zh",
      bodyBlocks: defaultBodyBlocksString("关于页面的正文。"),
    }),
    makeSeedRecord("pages", {
      slug: "contact",
      status: "draft",
      titleZh: "联系",
      titleEn: "Contact",
      summaryZh: "临时联系页面。",
      summaryEn: "Temporary contact page.",
      tags: "contact",
      bodyLanguage: "en",
      bodyBlocks: defaultBodyBlocksString("Contact page body."),
    }),
  ],
};

const store: AdminStore =
  globalThis.__gbaructionAdminStore ?? ({
    records: seedRecords,
  } satisfies AdminStore);

if (!globalThis.__gbaructionAdminStore) {
  globalThis.__gbaructionAdminStore = store;
}

declare global {
  var __gbaructionAdminStore: AdminStore | undefined;
}

function defaultBodyBlocksString(content = "") {
  return JSON.stringify(
    [
      {
        id: "body-intro",
        type: "richText",
        data: {
          content,
        },
      },
    ],
    null,
    2,
  );
}

function formatDatetimeLocal(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function parseBodyBlocksInput(value: string | undefined) {
  const raw = value?.trim();
  if (!raw) {
    return bodyBlocksSchema.parse([]);
  }

  return bodyBlocksSchema.parse(JSON.parse(raw));
}

function parseTagInput(value: string | undefined) {
  return Array.from(
    new Set(
      (value ?? "")
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function formatTagInput(values: string[]) {
  return values.join(", ");
}

function parseExternalLinksInput(value: string | undefined) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [label, href] = line.includes("|") ? line.split("|", 2) : [line, line];
      const trimmedHref = href?.trim();
      if (!trimmedHref) {
        return [];
      }

      return [
        {
          label: label.trim(),
          href: trimmedHref,
        },
      ];
    });
}

function formatExternalLinksInput(
  value: Array<{ label?: string | null; href?: string | null }> | null | undefined,
) {
  return (value ?? [])
    .map((item) => {
      const href = item.href?.trim();
      if (!href) {
        return null;
      }

      const label = item.label?.trim();
      return label && label !== href ? `${label}|${href}` : href;
    })
    .filter((item): item is string => Boolean(item))
    .join("\n");
}

function slugifyTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeSeedRecord(type: AdminContentType, fields: Record<string, string>): AdminContentRecord {
  return {
    id: randomUUID(),
    type,
    slug: fields.slug,
    status: (fields.status as AdminContentStatus) ?? "draft",
    title: fields.titleZh || fields.titleEn || fields.slug,
    summary: fields.summaryZh || fields.summaryEn || "",
    updatedAt: new Date("2026-04-05T09:00:00.000Z").toISOString(),
    publishedAt: fields.status === "published" ? new Date("2026-04-04T10:00:00.000Z").toISOString() : null,
    fields,
  };
}

function cloneRecord(record: AdminContentRecord): AdminContentRecord {
  return {
    ...record,
    fields: { ...record.fields },
  };
}

function cloneRecords(records: AdminContentRecord[]): AdminContentRecord[] {
  return records.map(cloneRecord);
}

async function listTagLabelsByContent(contentType: AdminContentType, contentIds: string[]) {
  if (!contentIds.length) {
    return new Map<string, string[]>();
  }

  const db = createDb();
  const rows = await db
    .select({
      contentId: contentTagLinks.contentId,
      labelZh: tags.labelZh,
    })
    .from(contentTagLinks)
    .innerJoin(tags, eq(contentTagLinks.tagId, tags.id))
    .where(and(eq(contentTagLinks.contentType, contentType), inArray(contentTagLinks.contentId, contentIds)));

  const map = new Map<string, string[]>();

  for (const row of rows) {
    const current = map.get(row.contentId) ?? [];
    current.push(row.labelZh);
    map.set(row.contentId, current);
  }

  return map;
}

function mapRecommendationRow(
  row: RecommendationRow,
  tagValues: string[],
): AdminContentRecord {
  return {
    id: row.id,
    type: "recommendations",
    slug: row.slug,
    status: row.status as AdminContentStatus,
    title: row.titleZh || row.titleEn || row.slug,
    summary: row.summaryZh || row.summaryEn || "",
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    fields: {
      slug: row.slug,
      titleZh: row.titleZh,
      titleEn: row.titleEn,
      summaryZh: row.summaryZh,
      summaryEn: row.summaryEn,
      tags: formatTagInput(tagValues),
      subjectName: row.subjectName,
      bodyLanguage: row.bodyLanguage,
      bodyBlocks: JSON.stringify(row.bodyBlocks, null, 2),
      embedProvider: row.embedProvider ?? "",
      embedUrl: row.embedUrl ?? "",
      externalLinks: formatExternalLinksInput(row.externalLinks as Array<{ label?: string; href?: string }>),
      seoTitleZh: row.seoTitleZh ?? "",
      seoTitleEn: row.seoTitleEn ?? "",
      seoDescriptionZh: row.seoDescriptionZh ?? "",
      seoDescriptionEn: row.seoDescriptionEn ?? "",
    },
  };
}

function mapShowRow(row: ShowRow, tagValues: string[]): AdminContentRecord {
  return {
    id: row.id,
    type: "shows",
    slug: row.slug,
    status: row.status as AdminContentStatus,
    title: row.titleZh || row.titleEn || row.slug,
    summary: row.summaryZh || row.summaryEn || "",
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    fields: {
      slug: row.slug,
      titleZh: row.titleZh,
      titleEn: row.titleEn,
      summaryZh: row.summaryZh,
      summaryEn: row.summaryEn,
      tags: formatTagInput(tagValues),
      startsAt: formatDatetimeLocal(row.startsAt),
      venue: row.venue,
      city: row.city,
      lineupTextZh: row.lineupTextZh,
      lineupTextEn: row.lineupTextEn,
      ticketUrl: row.ticketUrl ?? "",
      bodyLanguage: row.bodyLanguage,
      bodyBlocks: JSON.stringify(row.bodyBlocks, null, 2),
      seoTitleZh: row.seoTitleZh ?? "",
      seoTitleEn: row.seoTitleEn ?? "",
      seoDescriptionZh: row.seoDescriptionZh ?? "",
      seoDescriptionEn: row.seoDescriptionEn ?? "",
    },
  };
}

function mapInterviewRow(row: InterviewRow, tagValues: string[]): AdminContentRecord {
  return {
    id: row.id,
    type: "interviews",
    slug: row.slug,
    status: row.status as AdminContentStatus,
    title: row.titleZh || row.titleEn || row.slug,
    summary: row.summaryZh || row.summaryEn || "",
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    fields: {
      slug: row.slug,
      titleZh: row.titleZh,
      titleEn: row.titleEn,
      summaryZh: row.summaryZh,
      summaryEn: row.summaryEn,
      tags: formatTagInput(tagValues),
      relatedEntityTextZh: row.relatedEntityTextZh ?? "",
      relatedEntityTextEn: row.relatedEntityTextEn ?? "",
      bodyLanguage: row.bodyLanguage,
      bodyBlocks: JSON.stringify(row.bodyBlocks, null, 2),
      seoTitleZh: row.seoTitleZh ?? "",
      seoTitleEn: row.seoTitleEn ?? "",
      seoDescriptionZh: row.seoDescriptionZh ?? "",
      seoDescriptionEn: row.seoDescriptionEn ?? "",
    },
  };
}

function mapPageRow(row: PageRow, tagValues: string[]): AdminContentRecord {
  return {
    id: row.id,
    type: "pages",
    slug: row.slug,
    status: row.status as AdminContentStatus,
    title: row.titleZh || row.titleEn || row.slug,
    summary: row.summaryZh || row.summaryEn || "",
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    fields: {
      slug: row.slug,
      titleZh: row.titleZh,
      titleEn: row.titleEn,
      summaryZh: row.summaryZh,
      summaryEn: row.summaryEn,
      tags: formatTagInput(tagValues),
      bodyLanguage: row.bodyLanguage,
      bodyBlocks: JSON.stringify(row.bodyBlocks, null, 2),
      seoTitleZh: row.seoTitleZh ?? "",
      seoTitleEn: row.seoTitleEn ?? "",
      seoDescriptionZh: row.seoDescriptionZh ?? "",
      seoDescriptionEn: row.seoDescriptionEn ?? "",
    },
  };
}

async function syncContentTags(contentType: AdminContentType, contentId: string, rawTags: string) {
  const db = createDb();
  const nextTags = parseTagInput(rawTags);

  await db
    .delete(contentTagLinks)
    .where(and(eq(contentTagLinks.contentType, contentType), eq(contentTagLinks.contentId, contentId)));

  if (!nextTags.length) {
    return;
  }

  for (const value of nextTags) {
    const slug = slugifyTag(value);
    if (!slug) {
      continue;
    }

    const [tagRecord] = await db
      .insert(tags)
      .values({
        slug,
        labelZh: value,
        labelEn: value,
      })
      .onConflictDoUpdate({
        target: tags.slug,
        set: {
          labelZh: value,
          labelEn: value,
          updatedAt: new Date(),
        },
      })
      .returning({ id: tags.id });

    await db.insert(contentTagLinks).values({
      contentType,
      contentId,
      tagId: tagRecord.id,
    });
  }
}

async function listAdminContentFromDb(type: AdminContentType) {
  const db = createDb();

  switch (type) {
    case "recommendations": {
      const rows = await db.select().from(recommendations).orderBy(desc(recommendations.updatedAt));
      const tagMap = await listTagLabelsByContent(type, rows.map((row) => row.id));
      return rows.map((row) => mapRecommendationRow(row, tagMap.get(row.id) ?? []));
    }
    case "shows": {
      const rows = await db.select().from(shows).orderBy(desc(shows.updatedAt));
      const tagMap = await listTagLabelsByContent(type, rows.map((row) => row.id));
      return rows.map((row) => mapShowRow(row, tagMap.get(row.id) ?? []));
    }
    case "interviews": {
      const rows = await db.select().from(interviews).orderBy(desc(interviews.updatedAt));
      const tagMap = await listTagLabelsByContent(type, rows.map((row) => row.id));
      return rows.map((row) => mapInterviewRow(row, tagMap.get(row.id) ?? []));
    }
    case "pages": {
      const rows = await db.select().from(pages).orderBy(desc(pages.updatedAt));
      const tagMap = await listTagLabelsByContent(type, rows.map((row) => row.id));
      return rows.map((row) => mapPageRow(row, tagMap.get(row.id) ?? []));
    }
  }
}

async function getAdminContentFromDb(type: AdminContentType, id: string) {
  const db = createDb();
  const tagMap = await listTagLabelsByContent(type, [id]);

  switch (type) {
    case "recommendations": {
      const [row] = await db.select().from(recommendations).where(eq(recommendations.id, id));
      return row ? mapRecommendationRow(row, tagMap.get(id) ?? []) : null;
    }
    case "shows": {
      const [row] = await db.select().from(shows).where(eq(shows.id, id));
      return row ? mapShowRow(row, tagMap.get(id) ?? []) : null;
    }
    case "interviews": {
      const [row] = await db.select().from(interviews).where(eq(interviews.id, id));
      return row ? mapInterviewRow(row, tagMap.get(id) ?? []) : null;
    }
    case "pages": {
      const [row] = await db.select().from(pages).where(eq(pages.id, id));
      return row ? mapPageRow(row, tagMap.get(id) ?? []) : null;
    }
  }
}

async function saveAdminContentRecordToDb({
  type,
  id,
  status,
  fields,
}: {
  type: AdminContentType;
  id?: string;
  status: AdminContentStatus;
  fields: Record<string, string>;
}) {
  const db = createDb();
  const now = new Date();
  const publishedAt = status === "published" ? now : null;
  const bodyBlocks = parseBodyBlocksInput(fields.bodyBlocks);

  switch (type) {
    case "recommendations": {
      const values = {
        slug: fields.slug || `recommendation-${now.toISOString().slice(0, 10)}`,
        status,
        titleZh: fields.titleZh ?? "",
        titleEn: fields.titleEn ?? "",
        summaryZh: fields.summaryZh ?? "",
        summaryEn: fields.summaryEn ?? "",
        bodyBlocks,
        bodyLanguage: fields.bodyLanguage || "zh",
        subjectName: fields.subjectName ?? "",
        embedProvider: fields.embedProvider || null,
        embedUrl: fields.embedUrl || null,
        externalLinks: parseExternalLinksInput(fields.externalLinks),
        seoTitleZh: fields.seoTitleZh || null,
        seoTitleEn: fields.seoTitleEn || null,
        seoDescriptionZh: fields.seoDescriptionZh || null,
        seoDescriptionEn: fields.seoDescriptionEn || null,
        publishedAt,
        updatedAt: now,
      };
      const [row] = id
        ? await db.update(recommendations).set(values).where(eq(recommendations.id, id)).returning()
        : await db.insert(recommendations).values(values).returning();
      await syncContentTags(type, row.id, fields.tags ?? "");
      return (await getAdminContentFromDb(type, row.id))!;
    }
    case "shows": {
      const values = {
        slug: fields.slug || `show-${now.toISOString().slice(0, 10)}`,
        status,
        titleZh: fields.titleZh ?? "",
        titleEn: fields.titleEn ?? "",
        summaryZh: fields.summaryZh ?? "",
        summaryEn: fields.summaryEn ?? "",
        bodyBlocks,
        bodyLanguage: fields.bodyLanguage || "zh",
        startsAt: new Date(fields.startsAt || now.toISOString()),
        venue: fields.venue ?? "",
        city: fields.city ?? "",
        lineupTextZh: fields.lineupTextZh ?? "",
        lineupTextEn: fields.lineupTextEn ?? "",
        ticketUrl: fields.ticketUrl || null,
        seoTitleZh: fields.seoTitleZh || null,
        seoTitleEn: fields.seoTitleEn || null,
        seoDescriptionZh: fields.seoDescriptionZh || null,
        seoDescriptionEn: fields.seoDescriptionEn || null,
        publishedAt,
        updatedAt: now,
      };
      const [row] = id ? await db.update(shows).set(values).where(eq(shows.id, id)).returning() : await db.insert(shows).values(values).returning();
      await syncContentTags(type, row.id, fields.tags ?? "");
      return (await getAdminContentFromDb(type, row.id))!;
    }
    case "interviews": {
      const values = {
        slug: fields.slug || `interview-${now.toISOString().slice(0, 10)}`,
        status,
        titleZh: fields.titleZh ?? "",
        titleEn: fields.titleEn ?? "",
        summaryZh: fields.summaryZh ?? "",
        summaryEn: fields.summaryEn ?? "",
        bodyBlocks,
        bodyLanguage: fields.bodyLanguage || "zh",
        relatedEntityTextZh: fields.relatedEntityTextZh || null,
        relatedEntityTextEn: fields.relatedEntityTextEn || null,
        seoTitleZh: fields.seoTitleZh || null,
        seoTitleEn: fields.seoTitleEn || null,
        seoDescriptionZh: fields.seoDescriptionZh || null,
        seoDescriptionEn: fields.seoDescriptionEn || null,
        publishedAt,
        updatedAt: now,
      };
      const [row] = id ? await db.update(interviews).set(values).where(eq(interviews.id, id)).returning() : await db.insert(interviews).values(values).returning();
      await syncContentTags(type, row.id, fields.tags ?? "");
      return (await getAdminContentFromDb(type, row.id))!;
    }
    case "pages": {
      const values = {
        slug: fields.slug || `page-${now.toISOString().slice(0, 10)}`,
        status,
        titleZh: fields.titleZh ?? "",
        titleEn: fields.titleEn ?? "",
        summaryZh: fields.summaryZh ?? "",
        summaryEn: fields.summaryEn ?? "",
        bodyBlocks,
        bodyLanguage: fields.bodyLanguage || "zh",
        seoTitleZh: fields.seoTitleZh || null,
        seoTitleEn: fields.seoTitleEn || null,
        seoDescriptionZh: fields.seoDescriptionZh || null,
        seoDescriptionEn: fields.seoDescriptionEn || null,
        publishedAt,
        updatedAt: now,
      };
      const [row] = id ? await db.update(pages).set(values).where(eq(pages.id, id)).returning() : await db.insert(pages).values(values).returning();
      await syncContentTags(type, row.id, fields.tags ?? "");
      return (await getAdminContentFromDb(type, row.id))!;
    }
  }
}

export function isAdminContentType(value: string): value is AdminContentType {
  return value in collectionConfigs;
}

export function getAdminCollectionConfig(type: AdminContentType): AdminCollectionConfig {
  return collectionConfigs[type];
}

export function getAdminCollectionConfigs(): AdminCollectionConfig[] {
  return Object.values(collectionConfigs);
}

export async function listAdminContent(type: AdminContentType): Promise<AdminContentRecord[]> {
  if (hasDatabaseUrl()) {
    return listAdminContentFromDb(type);
  }

  return cloneRecords(store.records[type]).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getAdminContent(type: AdminContentType, id: string): Promise<AdminContentRecord | null> {
  if (hasDatabaseUrl()) {
    return getAdminContentFromDb(type, id);
  }

  const record = store.records[type].find((item) => item.id === id);
  return record ? cloneRecord(record) : null;
}

export async function getAdminDashboardSnapshot() {
  const collections = await Promise.all(
    getAdminCollectionConfigs().map(async (config) => {
      const records = await listAdminContent(config.type);

      return {
        ...config,
        counts: {
          total: records.length,
          draft: records.filter((record) => record.status === "draft").length,
          published: records.filter((record) => record.status === "published").length,
          archived: records.filter((record) => record.status === "archived").length,
        },
        recent: records.slice(0, 3),
      };
    }),
  );

  const recent = collections
    .flatMap((collection) => collection.recent.map((record) => ({ ...record, collection: collection.type })))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 6);

  return {
    collections,
    recent,
    totals: {
      total: collections.reduce((sum, item) => sum + item.counts.total, 0),
      draft: collections.reduce((sum, item) => sum + item.counts.draft, 0),
      published: collections.reduce((sum, item) => sum + item.counts.published, 0),
      archived: collections.reduce((sum, item) => sum + item.counts.archived, 0),
    },
  };
}

export async function saveAdminContentRecord({
  type,
  id,
  status,
  fields,
}: {
  type: AdminContentType;
  id?: string;
  status: AdminContentStatus;
  fields: Record<string, string>;
}): Promise<AdminContentRecord> {
  if (hasDatabaseUrl()) {
    return saveAdminContentRecordToDb({ type, id, status, fields });
  }

  const now = new Date().toISOString();
  const title = fields.titleZh || fields.titleEn || fields.slug || collectionConfigs[type].singularLabel;
  const summary = fields.summaryZh || fields.summaryEn || "";
  const publishedAt = status === "published" ? now : null;
  const existingIndex = id ? store.records[type].findIndex((record) => record.id === id) : -1;

  if (existingIndex >= 0) {
    const current = store.records[type][existingIndex];
    const nextRecord: AdminContentRecord = {
      ...current,
      slug: fields.slug || current.slug,
      status,
      title,
      summary,
      updatedAt: now,
      publishedAt: publishedAt ?? current.publishedAt,
      fields: {
        ...current.fields,
        ...fields,
        bodyBlocks: fields.bodyBlocks || current.fields.bodyBlocks || defaultBodyBlocksString(),
      },
    };

    store.records[type][existingIndex] = nextRecord;
    return cloneRecord(nextRecord);
  }

  const record: AdminContentRecord = {
    id: randomUUID(),
    type,
    slug: fields.slug || `${collectionConfigs[type].type}-${now.slice(0, 10)}`,
    status,
    title,
    summary,
    updatedAt: now,
    publishedAt,
    fields: {
      ...fields,
      bodyBlocks: fields.bodyBlocks || defaultBodyBlocksString(),
    },
  };

  store.records[type].unshift(record);
  return cloneRecord(record);
}
