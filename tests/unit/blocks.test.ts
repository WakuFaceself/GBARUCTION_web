import { describe, expect, it } from "vitest";

import { bodyBlocksSchema } from "@/lib/blocks/schema";
import { extractSearchText } from "@/lib/blocks/extract-text";

describe("block contracts", () => {
  it("accepts supported block types", () => {
    const result = bodyBlocksSchema.safeParse([
      {
        id: "hero-1",
        type: "hero",
        data: {
          title: "Poster",
        },
      },
    ]);

    expect(result.success).toBe(true);
  });

  it("does not index body blocks for search", () => {
    const result = extractSearchText({
      title: "Demo",
      summary: "Summary",
      tags: ["noise"],
      bodyBlocks: [{ type: "richText", content: "正文内容" }],
    });

    expect(result).toContain("Demo");
    expect(result).toContain("Summary");
    expect(result).toContain("noise");
    expect(result).not.toContain("正文内容");
  });
});
