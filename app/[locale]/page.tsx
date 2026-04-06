import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentList } from "@/components/site/content-list";
import { isLocale } from "@/lib/i18n";
import { getBrowseHighlights, getManagedPage } from "@/lib/queries/public/content";
import { getPublicSiteSettings } from "@/lib/queries/public/site";

const copy = {
  zh: {
    eyebrow: "GBARUCTION label magazine",
    title: "推荐先于噪声，现场跟在后面。",
    blurb:
      "把推荐、演出、采访和未来的海报实验室收进同一张持续更新的策展封面里。",
    ctaLabel: "进入推荐",
    ctaHref: "/zh/recommend",
    secondaryLabel: "海报实验室",
    secondaryHref: "/zh/poster-lab",
    recommendationTitle: "本期推荐",
    showTitle: "近期演出",
    interviewTitle: "采访片段",
  },
  en: {
    eyebrow: "GBARUCTION label magazine",
    title: "Recommendations first, the live wire right behind them.",
    blurb:
      "A rolling editorial cover for music picks, shows, interviews, and the future poster lab.",
    ctaLabel: "Enter recommendations",
    ctaHref: "/en/recommend",
    secondaryLabel: "Poster Lab",
    secondaryHref: "/en/poster-lab",
    recommendationTitle: "Current Recommendations",
    showTitle: "Upcoming Shows",
    interviewTitle: "Interview Fragments",
  },
} as const;

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = copy[locale];
  const [highlights, siteSettings] = await Promise.all([getBrowseHighlights(locale), getPublicSiteSettings()]);
  const [heroPage, posterLabPage] = await Promise.all([
    siteSettings.home.heroSlug ? getManagedPage(siteSettings.home.heroSlug) : Promise.resolve(null),
    siteSettings.home.posterLabSlug ? getManagedPage(siteSettings.home.posterLabSlug) : Promise.resolve(null),
  ]);
  const blurb = heroPage?.item.summary[locale] || (locale === "zh" ? siteSettings.editorialNote : "A rolling editorial cover for music picks, shows, interviews, and the future poster lab.");
  const heroTitle = heroPage?.item.title[locale] || content.title;
  const posterSlug = siteSettings.home.posterLabSlug || "poster-lab";
  const secondaryHref = `/${locale}/${posterSlug === "poster-lab" ? "poster-lab" : `pages/${posterSlug}`}`;
  const secondaryLabel = posterLabPage?.item.title[locale] || content.secondaryLabel;

  return (
    <main className="space-y-12 pb-16 pt-4">
      <section className="grid gap-8 border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)] lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">{`${siteSettings.siteTitle} label magazine`}</p>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] sm:text-7xl">
            {heroTitle}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[#d7c9ba] sm:text-lg">{blurb}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={content.ctaHref}
              className="rounded-full border border-[#ff8a63] bg-[#ff8a63] px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#1d130d]"
            >
              {content.ctaLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#f5efe6]"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
        <aside className="space-y-4 border-l border-white/10 pl-0 lg:pl-6">
          <p className="text-xs uppercase tracking-[0.45em] text-[#9f9387]">
            {locale === "zh" ? "策展快照" : "curation snapshot"}
          </p>
          <div className="space-y-3 text-sm leading-7 text-[#f5ece0]">
            {highlights.recommendations.slice(0, 2).map((item) => (
              <Link
                key={item.slug}
                href={`/${locale}/recommend/${item.slug}`}
                className="block border border-white/10 bg-black/20 p-4 transition-colors hover:border-[#ff8a63]/40"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[#9f9387]">
                  {item.displayDate}
                </p>
                <p className="mt-2 text-lg font-black uppercase leading-tight text-[#fff7ee]">
                  {item.displayTitle}
                </p>
                <p className="mt-2 text-sm text-[#d7c9ba]">{item.displaySummary}</p>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-[0.08em] text-[#fff7ee]">
            {content.recommendationTitle}
          </h2>
          <Link href={`/${locale}/recommend`} className="text-xs uppercase tracking-[0.35em] text-[#d7c9ba]">
            {locale === "zh" ? "查看全部" : "view all"}
          </Link>
        </div>
        <ContentList locale={locale} items={highlights.recommendations} kind="recommendation" />
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-[0.08em] text-[#fff7ee]">
              {content.showTitle}
            </h2>
            <Link href={`/${locale}/shows`} className="text-xs uppercase tracking-[0.35em] text-[#d7c9ba]">
              {locale === "zh" ? "查看全部" : "view all"}
            </Link>
          </div>
          <ContentList locale={locale} items={highlights.shows} kind="show" />
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-[0.08em] text-[#fff7ee]">
              {content.interviewTitle}
            </h2>
            <Link href={`/${locale}/interviews`} className="text-xs uppercase tracking-[0.35em] text-[#d7c9ba]">
              {locale === "zh" ? "查看全部" : "view all"}
            </Link>
          </div>
          <ContentList locale={locale} items={highlights.interviews} kind="interview" />
        </section>
      </div>
    </main>
  );
}
