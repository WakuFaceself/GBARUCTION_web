import { randomUUID } from "node:crypto";

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
      { name: "externalLinks", label: "External links", kind: "textarea" },
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
      subjectName: "Neon Pulse",
      bodyLanguage: "zh",
    }),
    makeSeedRecord("recommendations", {
      slug: "small-room-notes",
      status: "draft",
      titleZh: "小房间笔记",
      titleEn: "Small Room Notes",
      summaryZh: "从密闭空间里长出来的声音。",
      summaryEn: "A note from the smallest room in the building.",
      subjectName: "Room Tone",
      bodyLanguage: "en",
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
      startsAt: "2026-04-18T20:00:00.000Z",
      venue: "Temple Hall",
      city: "Shanghai",
      lineupTextZh: "Opening set / Main act / Afterparty",
      lineupTextEn: "Opening set / Main act / Afterparty",
      bodyLanguage: "zh",
    }),
    makeSeedRecord("shows", {
      slug: "warehouse-loop",
      status: "draft",
      titleZh: "仓库回路",
      titleEn: "Warehouse Loop",
      summaryZh: "尚未公开的深夜现场。",
      summaryEn: "A late-night booking still under wraps.",
      startsAt: "2026-05-02T21:30:00.000Z",
      venue: "Warehouse 9",
      city: "Hangzhou",
      lineupTextZh: "TBA",
      lineupTextEn: "TBA",
      bodyLanguage: "en",
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
      relatedEntityTextZh: "Drum Circle",
      relatedEntityTextEn: "Drum Circle",
      bodyLanguage: "zh",
    }),
    makeSeedRecord("interviews", {
      slug: "after-the-set",
      status: "draft",
      titleZh: "演出之后",
      titleEn: "After the Set",
      summaryZh: "编辑中的口述记录。",
      summaryEn: "An oral history still being edited.",
      relatedEntityTextZh: "Set List",
      relatedEntityTextEn: "Set List",
      bodyLanguage: "en",
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
      bodyLanguage: "zh",
    }),
    makeSeedRecord("pages", {
      slug: "contact",
      status: "draft",
      titleZh: "联系",
      titleEn: "Contact",
      summaryZh: "临时联系页面。",
      summaryEn: "Temporary contact page.",
      bodyLanguage: "en",
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
  // eslint-disable-next-line no-var
  var __gbaructionAdminStore: AdminStore | undefined;
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

export function isAdminContentType(value: string): value is AdminContentType {
  return value in collectionConfigs;
}

export function getAdminCollectionConfig(type: AdminContentType): AdminCollectionConfig {
  return collectionConfigs[type];
}

export function getAdminCollectionConfigs(): AdminCollectionConfig[] {
  return Object.values(collectionConfigs);
}

export function listAdminContent(type: AdminContentType): AdminContentRecord[] {
  return cloneRecords(store.records[type]).sort((left, right) => {
    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function getAdminContent(type: AdminContentType, id: string): AdminContentRecord | null {
  const record = store.records[type].find((item) => item.id === id);
  return record ? cloneRecord(record) : null;
}

export function getAdminDashboardSnapshot() {
  const collections = getAdminCollectionConfigs().map((config) => {
    const records = listAdminContent(config.type);
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
  });

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

export function saveAdminContentRecord({
  type,
  id,
  status,
  fields,
}: {
  type: AdminContentType;
  id?: string;
  status: AdminContentStatus;
  fields: Record<string, string>;
}): AdminContentRecord {
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
    fields,
  };

  store.records[type].unshift(record);
  return cloneRecord(record);
}

