import React from "react";

type RichTextBlockProps = {
  content: string;
};

export function RichTextBlock({ content }: RichTextBlockProps) {
  return (
    <article data-block-type="richText">
      {content.split(/\n+/).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </article>
  );
}
