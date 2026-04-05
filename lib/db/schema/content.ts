import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { mediaAssets } from "./media";

export const contentStatus = ["draft", "published", "archived"] as const;
export const bodyLanguages = ["zh", "en"] as const;

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  labelZh: text("label_zh").notNull(),
  labelEn: text("label_en").notNull(),
  ...timestamps,
});

export const recommendations = pgTable("recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("draft"),
  titleZh: text("title_zh").notNull(),
  titleEn: text("title_en").notNull(),
  summaryZh: text("summary_zh").notNull(),
  summaryEn: text("summary_en").notNull(),
  bodyBlocks: jsonb("body_blocks").notNull().default([]),
  bodyLanguage: text("body_language").notNull().default("zh"),
  subjectName: text("subject_name").notNull(),
  embedProvider: text("embed_provider"),
  embedUrl: text("embed_url"),
  externalLinks: jsonb("external_links").notNull().default([]),
  coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  seoTitleZh: text("seo_title_zh"),
  seoTitleEn: text("seo_title_en"),
  seoDescriptionZh: text("seo_description_zh"),
  seoDescriptionEn: text("seo_description_en"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const shows = pgTable("shows", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("draft"),
  titleZh: text("title_zh").notNull(),
  titleEn: text("title_en").notNull(),
  summaryZh: text("summary_zh").notNull(),
  summaryEn: text("summary_en").notNull(),
  bodyBlocks: jsonb("body_blocks").notNull().default([]),
  bodyLanguage: text("body_language").notNull().default("zh"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  ticketUrl: text("ticket_url"),
  lineupTextZh: text("lineup_text_zh").notNull(),
  lineupTextEn: text("lineup_text_en").notNull(),
  coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  seoTitleZh: text("seo_title_zh"),
  seoTitleEn: text("seo_title_en"),
  seoDescriptionZh: text("seo_description_zh"),
  seoDescriptionEn: text("seo_description_en"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const interviews = pgTable("interviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("draft"),
  titleZh: text("title_zh").notNull(),
  titleEn: text("title_en").notNull(),
  summaryZh: text("summary_zh").notNull(),
  summaryEn: text("summary_en").notNull(),
  bodyBlocks: jsonb("body_blocks").notNull().default([]),
  bodyLanguage: text("body_language").notNull().default("zh"),
  relatedEntityTextZh: text("related_entity_text_zh"),
  relatedEntityTextEn: text("related_entity_text_en"),
  coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  seoTitleZh: text("seo_title_zh"),
  seoTitleEn: text("seo_title_en"),
  seoDescriptionZh: text("seo_description_zh"),
  seoDescriptionEn: text("seo_description_en"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const pages = pgTable("pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("draft"),
  titleZh: text("title_zh").notNull(),
  titleEn: text("title_en").notNull(),
  summaryZh: text("summary_zh").notNull(),
  summaryEn: text("summary_en").notNull(),
  bodyBlocks: jsonb("body_blocks").notNull().default([]),
  bodyLanguage: text("body_language").notNull().default("zh"),
  seoTitleZh: text("seo_title_zh"),
  seoTitleEn: text("seo_title_en"),
  seoDescriptionZh: text("seo_description_zh"),
  seoDescriptionEn: text("seo_description_en"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull().default({}),
  ...timestamps,
});

export const contentTagLinks = pgTable("content_tag_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: text("content_type").notNull(),
  contentId: uuid("content_id").notNull(),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
  ...timestamps,
});
