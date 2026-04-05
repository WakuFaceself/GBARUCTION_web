import React from "react";
import type { ReactNode } from "react";

import type { ContentBlock } from "./schema";

import { CardGridBlock } from "@/components/public/blocks/card-grid";
import { CtaBlock } from "@/components/public/blocks/cta";
import { EventMetaBlock } from "@/components/public/blocks/event-meta";
import { HeroBlock } from "@/components/public/blocks/hero";
import { ImageBlock } from "@/components/public/blocks/image";
import { MusicEmbedBlock } from "@/components/public/blocks/music-embed";
import { QuoteBlock } from "@/components/public/blocks/quote";
import { RichTextBlock } from "@/components/public/blocks/rich-text";

type SupportedLocale = "zh" | "en";
type BlockData = Record<string, unknown>;

export type BlockRendererProps = {
  locale: SupportedLocale;
  bodyLanguage: SupportedLocale;
  blocks: ContentBlock[];
  className?: string;
};

function isRecord(value: unknown): value is BlockData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function readStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(readString).filter((item): item is string => Boolean(item));
}

function readBlockData(block: ContentBlock): BlockData {
  return isRecord(block.data) ? block.data : {};
}

function renderBlock(block: ContentBlock): ReactNode {
  const data = readBlockData(block);

  switch (block.type) {
    case "hero":
      return (
        <HeroBlock
          eyebrow={readString(data.eyebrow)}
          title={readString(data.title) ?? ""}
          description={readString(data.description)}
          ctaLabel={readString(data.ctaLabel)}
          ctaHref={readString(data.ctaHref)}
        />
      );
    case "richText":
      return <RichTextBlock content={readString(data.content) ?? ""} />;
    case "image":
      return (
        <ImageBlock
          src={readString(data.src) ?? ""}
          alt={readString(data.alt) ?? ""}
          caption={readString(data.caption)}
        />
      );
    case "quote":
      return (
        <QuoteBlock
          quote={readString(data.quote) ?? readString(data.text) ?? ""}
          attribution={readString(data.attribution)}
        />
      );
    case "musicEmbed":
      return (
        <MusicEmbedBlock
          src={readString(data.src) ?? readString(data.url) ?? ""}
          title={readString(data.title)}
          caption={readString(data.caption)}
        />
      );
    case "cardGrid": {
      const cards = Array.isArray(data.cards) ? data.cards : [];
      const normalizedCards = cards.flatMap((card) => {
        if (!isRecord(card)) {
          return [];
        }

        const title = readString(card.title);

        if (!title) {
          return [];
        }

        return [
          {
            title,
            description: readString(card.description),
            href: readString(card.href),
          },
        ];
      });

      return (
        <CardGridBlock
          title={readString(data.title)}
          description={readString(data.description)}
          cards={normalizedCards}
        />
      );
    }
    case "cta":
      return (
        <CtaBlock
          title={readString(data.title)}
          description={readString(data.description)}
          primary={
            readString(data.primaryLabel) && readString(data.primaryHref)
              ? {
                  label: readString(data.primaryLabel) ?? "",
                  href: readString(data.primaryHref) ?? "",
                }
              : undefined
          }
          secondary={
            readString(data.secondaryLabel) && readString(data.secondaryHref)
              ? {
                  label: readString(data.secondaryLabel) ?? "",
                  href: readString(data.secondaryHref) ?? "",
                }
              : undefined
          }
        />
      );
    case "eventMeta":
      return (
        <EventMetaBlock
          date={readString(data.date)}
          time={readString(data.time)}
          location={readString(data.location)}
          venue={readString(data.venue)}
        />
      );
    default:
      return null;
  }
}

export function getBodyFallbackNotice(
  locale: SupportedLocale,
  bodyLanguage: SupportedLocale,
) {
  if (locale === "en" && bodyLanguage === "zh") {
    return "This page's body is shown in its original language.";
  }

  return "";
}

export function BlockRenderer({
  locale,
  bodyLanguage,
  blocks,
  className,
}: BlockRendererProps) {
  const notice = getBodyFallbackNotice(locale, bodyLanguage);

  return (
    <section data-block-renderer className={className}>
      {notice ? <p data-body-language-notice>{notice}</p> : null}
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block)}</div>
      ))}
    </section>
  );
}
