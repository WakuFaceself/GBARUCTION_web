import type { Metadata } from "next";

import { ContentList } from "@/components/site/content-list";
import { getPublicCollection } from "@/lib/queries/public/content";
import { buildSiteMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return buildSiteMetadata(locale, "/recommend", locale === "zh" ? "推荐" : "Recommendations");
}

export default async function RecommendPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return null;
  }

  const items = await getPublicCollection("recommendation", locale);
  const hero = items[0];

  return (
    <main className="space-y-8 pb-16">
      <section className="grid gap-6 border border-white/10 bg-white/5 p-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">
            {locale === "zh" ? "推荐优先" : "recommendation first"}
          </p>
          <h1 className="max-w-3xl break-words text-5xl font-black uppercase leading-[0.9] tracking-[0.08em] [overflow-wrap:anywhere] sm:text-7xl">
            {locale === "zh" ? "推荐" : "Recommendations"}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#d9cabd]">
            {locale === "zh"
              ? "先看推荐，再延伸到演出与采访。这里的节奏像一张不断更新的剪贴板。"
              : "Start with recommendations, then drift into shows and interviews. The pace feels like a living cut-up board."}
          </p>
        </div>
        {hero ? (
          <aside className="border border-[#ff8a63]/30 bg-[#ff8a63]/10 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[#ffd2c0]">
              {locale === "zh" ? "本期封面" : "current cover"}
            </p>
            <p className="mt-4 break-words text-3xl font-black uppercase tracking-[0.08em] text-[#fff5eb] [overflow-wrap:anywhere]">
              {hero.displayTitle}
            </p>
            <p className="mt-2 text-sm leading-7 text-[#f2ddcf]">
              {hero.displaySummary}
            </p>
          </aside>
        ) : null}
      </section>

      <ContentList locale={locale} kind="recommendation" items={items} />
    </main>
  );
}
