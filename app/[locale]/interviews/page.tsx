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

  return buildSiteMetadata(locale, "/interviews", locale === "zh" ? "采访" : "Interviews");
}

export default async function InterviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return null;
  }

  const items = getPublicCollection("interview", locale);

  return (
    <main className="space-y-8 pb-16">
      <section className="border border-white/10 bg-white/5 p-5 lg:p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">
          {locale === "zh" ? "采访入口" : "interview window"}
        </p>
        <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] sm:text-7xl">
          {locale === "zh" ? "采访" : "Interviews"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#d9cabd]">
          {locale === "zh"
            ? "让人物温度和长期价值留在站内，但不把视觉噪音推过阅读边界。"
            : "Keep the people stories and long-form value on-site without overwhelming readability."}
        </p>
      </section>

      <ContentList locale={locale} kind="interview" items={items} />
    </main>
  );
}
