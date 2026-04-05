import React from "react";

type ImageBlockProps = {
  src: string;
  alt: string;
  caption?: string;
};

export function ImageBlock({ src, alt, caption }: ImageBlockProps) {
  return (
    <figure data-block-type="image">
      <img src={src} alt={alt} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
