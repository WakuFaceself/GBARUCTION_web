import React from "react";
import Image from "next/image";

type ImageBlockProps = {
  src: string;
  alt: string;
  caption?: string;
};

export function ImageBlock({ src, alt, caption }: ImageBlockProps) {
  return (
    <figure data-block-type="image">
      <Image src={src} alt={alt} width={1600} height={1200} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
