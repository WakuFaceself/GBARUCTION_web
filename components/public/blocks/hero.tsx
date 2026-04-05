import React from "react";

type HeroBlockProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function HeroBlock({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
}: HeroBlockProps) {
  return (
    <section data-block-type="hero">
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {ctaLabel && ctaHref ? <a href={ctaHref}>{ctaLabel}</a> : null}
    </section>
  );
}
