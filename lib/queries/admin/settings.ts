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

type MemorySettingsStore = {
  records: Record<string, SiteSettingsRecord>;
};

declare global {
  var __gbaructionSettingsStore: MemorySettingsStore | undefined;
}

const defaultSettings: SiteSettingsRecord = {
  siteTitle: "GBARUCTION",
  defaultLocale: "zh",
  editorialNote: "Editorial defaults, syndication preferences, and controller-ready flags.",
};

function getMemorySettingsStore() {
  if (!globalThis.__gbaructionSettingsStore) {
    globalThis.__gbaructionSettingsStore = {
      records: {
        global: defaultSettings,
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

export async function getSiteSettingsRecord(): Promise<SiteSettingsRecord> {
  if (hasDatabaseUrl()) {
    const db = createDb();
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, "global"));
    return normalizeSettings(row?.value);
  }

  return getMemorySettingsStore().records.global ?? defaultSettings;
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
