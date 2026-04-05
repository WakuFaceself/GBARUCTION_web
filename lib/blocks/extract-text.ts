type SearchIndexInput = {
  title: string;
  summary: string;
  tags: string[];
  bodyBlocks: unknown[];
};

export function extractSearchText(input: SearchIndexInput) {
  return [input.title, input.summary, ...input.tags].filter(Boolean).join(" ");
}
