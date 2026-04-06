import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BlockRenderer, getBodyFallbackNotice } from "../../lib/blocks/render";

describe("block renderer", () => {
  it("shows an english notice when english locale renders chinese body", () => {
    expect(getBodyFallbackNotice("en", "zh")).toBe(
      "This page's body is shown in its original language.",
    );
  });

  it("renders the initial public block set", () => {
    const html = renderToStaticMarkup(
      createElement(BlockRenderer, {
        locale: "en",
        bodyLanguage: "zh",
        blocks: [
          {
            id: "hero-1",
            type: "hero",
            data: {
              title: "Poster",
              eyebrow: "Feature",
              description: "Launch night",
            },
          },
        ],
      }),
    );

    expect(html).toContain("data-body-language-notice");
    expect(html).toContain("Poster");
    expect(html).toContain("Feature");
  });
});
