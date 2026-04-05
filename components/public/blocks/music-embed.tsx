import React from "react";

type MusicEmbedBlockProps = {
  src: string;
  title?: string;
  caption?: string;
};

export function MusicEmbedBlock({ src, title, caption }: MusicEmbedBlockProps) {
  return (
    <section data-block-type="musicEmbed">
      <iframe src={src} title={title ?? "Music embed"} />
      {caption ? <p>{caption}</p> : null}
    </section>
  );
}
