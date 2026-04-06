import type { Metadata } from "next";
import Link from "next/link";

import { BlockRenderer } from "@/lib/blocks/render";
import { buildSiteMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/i18n";
import { getManagedPage } from "@/lib/queries/public/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return buildSiteMetadata(locale, "/poster-lab", locale === "zh" ? "海报实验室" : "Poster Lab");
}

export default async function PosterLabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return null;
  }

  const page = await getManagedPage("poster-lab");

  if (!page) {
    return null;
  }

  return (
    <main className="space-y-8 pb-16">
      <section className="grid gap-6 border border-white/10 bg-white/5 p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">
            {locale === "zh" ? "概念入口" : "concept gate"}
          </p>
          <h1 className="max-w-3xl break-words text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] [overflow-wrap:anywhere] sm:text-7xl">
            {page.item.title[locale]}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#d9cabd]">
            {page.item.summary[locale]}
          </p>
        </div>
        <aside className="space-y-3 border border-[#ff8a63]/30 bg-[#ff8a63]/10 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[#ffd2c0]">
            {locale === "zh" ? "状态" : "status"}
          </p>
          <p className="break-words text-xl font-black uppercase tracking-[0.08em] text-[#fff6ee] [overflow-wrap:anywhere]">
            {locale === "zh" ? "尚未开放" : "not live yet"}
          </p>
          <p className="text-sm leading-7 text-[#f2ddcf]">
            {locale === "zh"
              ? "后续会承接模板、贴纸、文字编排与 AI 辅助生成。"
              : "Later it can hold templates, stickers, type layouts, and AI-assisted generation."}
          </p>
        </aside>
      </section>

      <section className="border border-white/10 bg-black/20 p-5">
        <BlockRenderer
          locale={locale}
          bodyLanguage={page.item.bodyLanguage}
          blocks={page.item.bodyBlocks}
          className="space-y-4 text-base leading-8 text-[#efe3d6] [&_[data-body-language-notice]]:rounded [&_[data-body-language-notice]]:border [&_[data-body-language-notice]]:border-[#ff8a63]/30 [&_[data-body-language-notice]]:bg-[#ff8a63]/10 [&_[data-body-language-notice]]:px-3 [&_[data-body-language-notice]]:py-2 [&_[data-body-language-notice]]:text-sm [&_[data-body-language-notice]]:text-[#ffd5c4]"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          locale === "zh" ? "模板" : "templates",
          locale === "zh" ? "贴纸" : "stickers",
          locale === "zh" ? "拼贴" : "collage",
        ].map((item, index) => (
          <div
            key={item}
            className="border border-white/10 bg-black/20 p-4"
            style={{ transform: index % 2 === 0 ? "rotate(-0.8deg)" : "rotate(0.5deg)" }}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-[#9f9387]">{item}</p>
            <p className="mt-3 text-sm leading-7 text-[#efe3d6]">
              {locale === "zh"
                ? "这里现在只有概念占位，不提供任何编辑能力。"
                : "Only a conceptual placeholder for now. No editing capability yet."}
            </p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/${locale}/recommend`}
          className="max-w-full rounded-full border border-[#ff8a63]/40 bg-[#ff8a63]/10 px-4 py-2 text-sm uppercase tracking-[0.25em] text-[#ffd7c7] [overflow-wrap:anywhere]"
        >
          {locale === "zh" ? "回到推荐" : "Back to recommendations"}
        </Link>
      </div>
    </main>
  );
}
