import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import type { PublicContentItem, PublicKind } from "@/lib/queries/public/content";

const kindLabels: Record<Locale, Record<PublicKind, string>> = {
  zh: {
    recommendation: "推荐",
    show: "演出",
    interview: "采访",
  },
  en: {
    recommendation: "Recommendations",
    show: "Shows",
    interview: "Interviews",
  },
};

export function ContentList({
  locale,
  items,
  kind,
}: {
  locale: Locale;
  kind: PublicKind;
  items: Array<
    PublicContentItem & {
      displayTitle: string;
      displaySummary: string;
      displayDate: string;
      displayTags: string[];
    }
  >;
}) {
  return (
    <section className="grid gap-4">
      {items.map((item, index) => (
        <article
          key={item.slug}
          className="grid min-w-0 gap-4 border border-white/10 bg-white/5 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.24)] sm:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.9fr)]"
          style={{
            transform: index % 2 === 0 ? "rotate(-0.4deg)" : "rotate(0.35deg)",
          }}
        >
          <div className="min-w-0 space-y-3">
            {item.cover?.publicUrl ? (
              <div className="overflow-hidden border border-white/10 bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.cover.publicUrl}
                  alt={item.cover.altText || item.displayTitle}
                  className="h-48 w-full object-cover"
                />
              </div>
            ) : null}
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-[#d9cfc2]">
              <span className="max-w-full rounded-full border border-[#ff8a63]/30 bg-[#ff8a63]/10 px-2 py-1 text-[#ffc8b0] [overflow-wrap:anywhere]">
                {kindLabels[locale][kind]}
              </span>
              <span>{item.displayDate}</span>
              {item.featured ? <span>featured</span> : null}
            </div>
            <Link
              href={`/${locale}/${kind === "recommendation" ? "recommend" : kind === "show" ? "shows" : "interviews"}/${item.slug}`}
              className="block min-w-0 break-words text-3xl font-black uppercase leading-none tracking-[0.08em] text-[#fff7ee] [overflow-wrap:anywhere] hover:text-[#ffb08e] sm:text-4xl"
            >
              {item.displayTitle}
            </Link>
            <p className="max-w-2xl text-sm leading-7 text-[#d7c9ba] sm:text-base">
              {item.displaySummary}
            </p>
          </div>
          <div className="min-w-0 space-y-4 border-l border-white/10 pl-0 pt-2 sm:border-l sm:pl-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[#9c8f82]">
              {locale === "zh" ? "标签" : "tags"}
            </p>
            <div className="flex flex-wrap gap-2">
              {item.displayTags.map((tag) => (
                <span
                  key={tag}
                  className="max-w-full rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs uppercase tracking-[0.22em] text-[#f6ebdf] [overflow-wrap:anywhere]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
