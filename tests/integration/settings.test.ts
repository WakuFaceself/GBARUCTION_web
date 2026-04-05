import { beforeEach, describe, expect, it } from "vitest";

import { getSiteSettingsRecord, saveSiteSettingsRecord } from "@/lib/queries/admin/settings";
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

  it("orders homepage highlights by configured slug order", () => {
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
