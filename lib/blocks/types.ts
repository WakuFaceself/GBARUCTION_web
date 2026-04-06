export const blockTypes = [
  "hero",
  "richText",
  "image",
  "quote",
  "musicEmbed",
  "cardGrid",
  "cta",
  "eventMeta",
] as const;

export type BlockType = (typeof blockTypes)[number];
