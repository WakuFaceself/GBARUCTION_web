import { describe, expect, it } from "vitest";

import { searchPublicContent } from "@/lib/queries/public/content";

describe("public search scope", () => {
  it("matches title, summary, and tags", async () => {
    expect((await searchPublicContent("drift", "zh")).map((item) => item.slug)).toContain("neon-drift");
    expect((await searchPublicContent("humid", "en")).map((item) => item.slug)).toContain("neon-drift");
    expect((await searchPublicContent("warehouse", "en")).map((item) => item.slug)).toContain("basement-signal");
  });

  it("does not index body block text", async () => {
    await expect(searchPublicContent("single-language body example", "en")).resolves.toEqual([]);
    await expect(searchPublicContent("中文正文演示", "zh")).resolves.toEqual([]);
  });
});
