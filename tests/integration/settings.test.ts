import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  hasDatabaseUrl: () => false,
  env: {},
}));

import {
  getSiteSettingsHomeRecord,
  getSiteSettingsRecord,
  saveSiteSettingsHomeRecord,
  saveSiteSettingsRecord,
} from "@/lib/queries/admin/settings";
import { getBrowseHighlights } from "@/lib/queries/public/content";
import { getPublicSiteSettings, sortBySlugOrder } from "@/lib/queries/public/site";

describe("site settings persistence", () => {
  beforeEach(() => {
    globalThis.__gbaructionSettingsStore = undefined;
  });

  it("saves and reads back global site settings in fallback mode", async () => {
    await saveSiteSettingsRecord({
      siteTitle: "GBARUCTION Archive",
      defaultLocale: "en",
      editorialNote: "A sharper editorial note.",
    });

    const adminView = await getSiteSettingsRecord();
    const publicView = await getPublicSiteSettings();

    expect(adminView).toEqual({
      siteTitle: "GBARUCTION Archive",
      defaultLocale: "en",
      editorialNote: "A sharper editorial note.",
    });
    expect(publicView.siteTitle).toBe("GBARUCTION Archive");
    expect(publicView.defaultLocale).toBe("en");
    expect(publicView.editorialNote).toBe("A sharper editorial note.");
  });

  it("saves and reads back homepage curation settings in fallback mode", async () => {
    await saveSiteSettingsHomeRecord({
      heroSlug: "landing",
      recommendations: ["terminal-bloom", "neon-drift", "black-mirror-loop"],
      shows: ["flicker-room", "basement-signal"],
      interviews: ["midnight-crew", "dust-operator"],
      posterLabSlug: "poster-lab-alt",
    });

    const adminHome = await getSiteSettingsHomeRecord();
    const publicView = await getPublicSiteSettings();

    expect(adminHome).toEqual({
      heroSlug: "landing",
      recommendations: ["terminal-bloom", "neon-drift", "black-mirror-loop"],
      shows: ["flicker-room", "basement-signal"],
      interviews: ["midnight-crew", "dust-operator"],
      posterLabSlug: "poster-lab-alt",
    });
    expect(publicView.home).toEqual(adminHome);
  });

  it("orders homepage highlights by configured slug order", async () => {
    await saveSiteSettingsHomeRecord({
      heroSlug: undefined,
      recommendations: ["black-mirror-loop", "neon-drift", "terminal-bloom"],
      shows: ["flicker-room", "basement-signal"],
      interviews: ["midnight-crew", "dust-operator"],
      posterLabSlug: "poster-lab",
    });

    const highlights = await getBrowseHighlights("en");

    expect(highlights.recommendations.map((item) => item.slug)).toEqual([
      "black-mirror-loop",
      "neon-drift",
      "terminal-bloom",
    ]);
    expect(highlights.shows.map((item) => item.slug)).toEqual(["flicker-room", "basement-signal"]);
    expect(highlights.interviews.map((item) => item.slug)).toEqual(["midnight-crew", "dust-operator"]);
  });

  it("keeps hero slug optional in homepage settings", async () => {
    await saveSiteSettingsHomeRecord({
      heroSlug: undefined,
      recommendations: ["neon-drift"],
      shows: [],
      interviews: [],
      posterLabSlug: "poster-lab",
    });

    const adminHome = await getSiteSettingsHomeRecord();

    expect(adminHome.heroSlug).toBeUndefined();
    expect(adminHome.recommendations).toEqual(["neon-drift"]);
  });

  it("sorts slugs with configured slugs first and keeps the rest after", () => {
    const sorted = sortBySlugOrder(
      [
        { slug: "gamma" },
        { slug: "alpha" },
        { slug: "beta" },
      ],
      ["beta", "alpha"],
    );

    expect(sorted.map((item) => item.slug)).toEqual(["beta", "alpha", "gamma"]);
  });
});
