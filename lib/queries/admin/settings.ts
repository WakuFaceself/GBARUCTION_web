import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { createDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema/content";
import { hasDatabaseUrl } from "@/lib/env";
import type { Locale } from "@/lib/i18n";

export type SiteSettingsRecord = {
  siteTitle: string;
  defaultLocale: Locale;
  editorialNote: string;
};

export type HomeSettingsRecord = {
  heroSlug?: string;
  recommendations: string[];
  shows: string[];
  interviews: string[];
  posterLabSlug: string;
};

type MemorySettingsStore = {
  records: {
    global: SiteSettingsRecord;
    home: HomeSettingsRecord;
  };
};

declare global {
  var __gbaructionSettingsStore: MemorySettingsStore | undefined;
}

const defaultSettings: SiteSettingsRecord = {
  siteTitle: "GBARUCTION",
  defaultLocale: "zh",
  editorialNote: "Editorial defaults, syndication preferences, and controller-ready flags.",
};

export const defaultHomeSettings: HomeSettingsRecord = {
  heroSlug: undefined,
  recommendations: [],
  shows: [],
  interviews: [],
  posterLabSlug: "poster-lab",
};

function getMemorySettingsStore() {
  if (!globalThis.__gbaructionSettingsStore) {
    globalThis.__gbaructionSettingsStore = {
      records: {
        global: defaultSettings,
        home: defaultHomeSettings,
      },
    };
  }

  return globalThis.__gbaructionSettingsStore;
}

function normalizeSettings(value: unknown): SiteSettingsRecord {
  if (!value || typeof value !== "object") {
    return defaultSettings;
  }

  const candidate = value as Partial<SiteSettingsRecord>;
  return {
    siteTitle: typeof candidate.siteTitle === "string" && candidate.siteTitle.trim() ? candidate.siteTitle.trim() : defaultSettings.siteTitle,
    defaultLocale: candidate.defaultLocale === "en" ? "en" : "zh",
    editorialNote:
      typeof candidate.editorialNote === "string" && candidate.editorialNote.trim()
        ? candidate.editorialNote.trim()
      : defaultSettings.editorialNote,
  };
}

function normalizeSlugList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const slug = item.trim();
    if (!slug || seen.has(slug)) {
      continue;
    }

    seen.add(slug);
    result.push(slug);
  }

  return result;
}

function normalizeHomeSettings(value: unknown): HomeSettingsRecord {
  if (!value || typeof value !== "object") {
    return defaultHomeSettings;
  }

  const candidate = value as Partial<HomeSettingsRecord>;
  return {
    heroSlug: typeof candidate.heroSlug === "string" && candidate.heroSlug.trim() ? candidate.heroSlug.trim() : undefined,
    recommendations: normalizeSlugList(candidate.recommendations),
    shows: normalizeSlugList(candidate.shows),
    interviews: normalizeSlugList(candidate.interviews),
    posterLabSlug:
      typeof candidate.posterLabSlug === "string" && candidate.posterLabSlug.trim()
        ? candidate.posterLabSlug.trim()
        : defaultHomeSettings.posterLabSlug,
  };
}

export async function getSiteSettingsRecord(): Promise<SiteSettingsRecord> {
  if (hasDatabaseUrl()) {
    const db = createDb();
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, "global"));
    return normalizeSettings(row?.value);
  }

  return getMemorySettingsStore().records.global ?? defaultSettings;
}

export async function getSiteSettingsHomeRecord(): Promise<HomeSettingsRecord> {
  if (hasDatabaseUrl()) {
    const db = createDb();
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, "home"));
    return normalizeHomeSettings(row?.value);
  }

  return getMemorySettingsStore().records.home ?? defaultHomeSettings;
}

export async function saveSiteSettingsRecord(input: SiteSettingsRecord) {
  const record = normalizeSettings(input);

  if (hasDatabaseUrl()) {
    const db = createDb();
    await db
      .insert(siteSettings)
      .values({
        id: randomUUID(),
        key: "global",
        value: record,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: record,
          updatedAt: new Date(),
        },
      });

    return record;
  }

  const store = getMemorySettingsStore();
  store.records.global = record;
  return record;
}

export async function saveSiteSettingsHomeRecord(input: HomeSettingsRecord) {
  const record = normalizeHomeSettings(input);

  if (hasDatabaseUrl()) {
    const db = createDb();
    await db
      .insert(siteSettings)
      .values({
        id: randomUUID(),
        key: "home",
        value: record,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: record,
          updatedAt: new Date(),
        },
      });

    return record;
  }

  const store = getMemorySettingsStore();
  store.records.home = record;
  return record;
}
