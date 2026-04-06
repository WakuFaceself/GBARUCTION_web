import React from "react";

type CTAButton = {
  label: string;
  href: string;
};

type CtaBlockProps = {
  title?: string;
  description?: string;
  primary?: CTAButton;
  secondary?: CTAButton;
};

export function CtaBlock({ title, description, primary, secondary }: CtaBlockProps) {
  return (
    <section data-block-type="cta">
      {title ? <h2>{title}</h2> : null}
      {description ? <p>{description}</p> : null}
      <div>
        {primary ? <a href={primary.href}>{primary.label}</a> : null}
        {secondary ? <a href={secondary.href}>{secondary.label}</a> : null}
      </div>
    </section>
  );
}
