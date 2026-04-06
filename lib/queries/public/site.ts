import { eq } from "drizzle-orm";

import { createDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema/content";
import { hasDatabaseUrl } from "@/lib/env";
import type { Locale } from "@/lib/i18n";
import { getSiteSettingsHomeRecord, getSiteSettingsRecord } from "@/lib/queries/admin/settings";

export type PublicSiteSettings = {
  siteTitle: string;
  defaultLocale: Locale;
  editorialNote: string;
  home: {
    heroSlug?: string;
    recommendations: string[];
    shows: string[];
    interviews: string[];
    posterLabSlug?: string;
  };
};

const fallbackSettings: PublicSiteSettings = {
  siteTitle: "GBARUCTION",
  defaultLocale: "zh",
  editorialNote: "把推荐、演出、采访和未来的海报实验室收进同一张持续更新的策展封面里。",
  home: {
    heroSlug: "home",
    recommendations: [],
    shows: [],
    interviews: [],
    posterLabSlug: "poster-lab",
  },
};

function normalizeGlobal(value: unknown) {
  if (!value || typeof value !== "object") {
    return {
      siteTitle: fallbackSettings.siteTitle,
      defaultLocale: fallbackSettings.defaultLocale,
      editorialNote: fallbackSettings.editorialNote,
    };
  }

  const candidate = value as Record<string, unknown>;
  return {
    siteTitle: typeof candidate.siteTitle === "string" && candidate.siteTitle.trim() ? candidate.siteTitle.trim() : fallbackSettings.siteTitle,
    defaultLocale: (candidate.defaultLocale === "en" ? "en" : "zh") as Locale,
    editorialNote:
      typeof candidate.editorialNote === "string" && candidate.editorialNote.trim()
        ? candidate.editorialNote.trim()
        : fallbackSettings.editorialNote,
  };
}

function normalizeHome(value: unknown) {
  if (!value || typeof value !== "object") {
    return fallbackSettings.home;
  }

  const candidate = value as Record<string, unknown>;
  const readList = (key: string) =>
    Array.isArray(candidate[key]) ? candidate[key].filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];

  return {
    heroSlug: typeof candidate.heroSlug === "string" ? candidate.heroSlug : fallbackSettings.home.heroSlug,
    recommendations: readList("recommendations"),
    shows: readList("shows"),
    interviews: readList("interviews"),
    posterLabSlug: typeof candidate.posterLabSlug === "string" ? candidate.posterLabSlug : fallbackSettings.home.posterLabSlug,
  };
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  if (!hasDatabaseUrl()) {
    const [global, home] = await Promise.all([getSiteSettingsRecord(), getSiteSettingsHomeRecord()]);
    return {
      ...global,
      home,
    };
  }

  const db = createDb();
  const [rows, homeRows] = await Promise.all([
    db.select().from(siteSettings).where(eq(siteSettings.key, "global")),
    db.select().from(siteSettings).where(eq(siteSettings.key, "home")),
  ]);

  return {
    ...normalizeGlobal(rows[0]?.value),
    home: normalizeHome(homeRows[0]?.value),
  };
}

export function sortBySlugOrder<T extends { slug: string }>(items: T[], orderedSlugs: string[]) {
  if (!orderedSlugs.length) {
    return items;
  }

  const rank = new Map(orderedSlugs.map((slug, index) => [slug, index]));

  return items.slice().sort((left, right) => {
    const leftRank = rank.get(left.slug);
    const rightRank = rank.get(right.slug);

    if (leftRank === undefined && rightRank === undefined) {
      return 0;
    }

    if (leftRank === undefined) {
      return 1;
    }

    if (rightRank === undefined) {
      return -1;
    }

    return leftRank - rightRank;
  });
}
