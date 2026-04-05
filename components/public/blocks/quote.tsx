import React from "react";

type QuoteBlockProps = {
  quote: string;
  attribution?: string;
};

export function QuoteBlock({ quote, attribution }: QuoteBlockProps) {
  return (
    <blockquote data-block-type="quote">
      <p>{quote}</p>
      {attribution ? <footer>{attribution}</footer> : null}
    </blockquote>
  );
}
