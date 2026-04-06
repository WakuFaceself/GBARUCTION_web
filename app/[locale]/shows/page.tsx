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

  return buildSiteMetadata(locale, "/shows", locale === "zh" ? "演出" : "Shows");
}

export default async function ShowsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return null;
  }

  const items = await getPublicCollection("show", locale);

  return (
    <main className="space-y-8 pb-16">
      <section className="border border-white/10 bg-white/5 p-5 lg:p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">
          {locale === "zh" ? "演出入口" : "show window"}
        </p>
        <h1 className="mt-3 break-words text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] [overflow-wrap:anywhere] sm:text-7xl">
          {locale === "zh" ? "演出" : "Shows"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#d9cabd]">
          {locale === "zh"
            ? "保留现场传播的清晰度，同时继续维持厂牌的拼贴气质。"
            : "Keep the live information sharp while the collage language stays intact."}
        </p>
      </section>

      <ContentList locale={locale} kind="show" items={items} />
    </main>
  );
}
