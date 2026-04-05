import Link from "next/link";

import { BlockRenderer } from "@/lib/blocks/render";
import type { Locale } from "@/lib/i18n";
import type { PublicContentItem } from "@/lib/queries/public/content";
import { formatPublicDate } from "@/lib/queries/public/content";

export function ContentDetail({
  locale,
  item,
  collection,
}: {
  locale: Locale;
  item: PublicContentItem;
  collection: "recommend" | "shows" | "interviews";
}) {
  return (
    <article className="grid gap-8 pb-16 pt-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">
            {collection}
          </p>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] sm:text-7xl">
            {item.title[locale]}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-[#d7c9ba]">
            {item.summary[locale]}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-[#aa9f92]">
          <span>{formatPublicDate(item.publishedAt, locale)}</span>
          <span>•</span>
          <span>{item.bodyLanguage === locale ? locale : item.bodyLanguage}</span>
        </div>

        <div className="border border-white/10 bg-white/5 p-5">
          <BlockRenderer
            locale={locale}
            bodyLanguage={item.bodyLanguage}
            blocks={item.bodyBlocks}
            className="space-y-4 text-base leading-8 text-[#f5ecdf] [&_[data-body-language-notice]]:mb-4 [&_[data-body-language-notice]]:rounded [&_[data-body-language-notice]]:border [&_[data-body-language-notice]]:border-[#ff8a63]/30 [&_[data-body-language-notice]]:bg-[#ff8a63]/10 [&_[data-body-language-notice]]:px-3 [&_[data-body-language-notice]]:py-2 [&_[data-body-language-notice]]:text-sm [&_[data-body-language-notice]]:text-[#ffd5c4]"
          />
        </div>
      </section>

      <aside className="space-y-4 border border-white/10 bg-black/20 p-5">
        <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">
          {locale === "zh" ? "快照" : "snapshot"}
        </p>
        <div className="space-y-3 text-sm leading-7 text-[#f5ece0]">
          <p>{item.summary[locale]}</p>
          <div className="space-y-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="mr-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.22em]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {"recommendation" in item && item.recommendation ? (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9f9387]">
              {locale === "zh" ? "试听与外链" : "listening"}
            </p>
            <p className="text-sm leading-7 text-[#f5ece0]">
              {item.recommendation.subjectName[locale]}
            </p>
            <div className="flex flex-wrap gap-2">
              {item.recommendation.externalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-[#ff8a63]/30 px-3 py-2 text-xs uppercase tracking-[0.25em] text-[#ffd1be]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {"show" in item && item.show ? (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9f9387]">
              {locale === "zh" ? "现场信息" : "show info"}
            </p>
            <p>{formatPublicDate(item.show.startsAt, locale)}</p>
            <p>{item.show.venue}</p>
            <p>{item.show.city}</p>
            <p className="text-sm text-[#d8c9b9]">{item.show.lineup[locale]}</p>
          </div>
        ) : null}
        {"interview" in item && item.interview ? (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9f9387]">
              {locale === "zh" ? "关联对象" : "related entity"}
            </p>
            <p className="text-sm text-[#f5ece0]">{item.interview.relatedEntityText[locale]}</p>
          </div>
        ) : null}
      </aside>
    </article>
  );
}
