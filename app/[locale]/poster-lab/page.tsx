import type { Metadata } from "next";
import Link from "next/link";

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

  return (
    <main className="space-y-8 pb-16">
      <section className="grid gap-6 border border-white/10 bg-white/5 p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">
            {locale === "zh" ? "概念入口" : "concept gate"}
          </p>
          <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] sm:text-7xl">
            {locale === "zh" ? "海报实验室" : "Poster Lab"}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#d9cabd]">
            {locale === "zh"
              ? "这不是一个真正可用的工具，而是为未来海报生成、模板和拼贴工作流预留的概念页。"
              : "This is not a live tool. It is a concept page reserved for future poster generation, templates, and collage workflows."}
          </p>
        </div>
        <aside className="space-y-3 border border-[#ff8a63]/30 bg-[#ff8a63]/10 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[#ffd2c0]">
            {locale === "zh" ? "状态" : "status"}
          </p>
          <p className="text-xl font-black uppercase tracking-[0.08em] text-[#fff6ee]">
            {locale === "zh" ? "尚未开放" : "not live yet"}
          </p>
          <p className="text-sm leading-7 text-[#f2ddcf]">
            {locale === "zh"
              ? "后续会承接模板、贴纸、文字编排与 AI 辅助生成。"
              : "Later it can hold templates, stickers, type layouts, and AI-assisted generation."}
          </p>
        </aside>
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
          className="rounded-full border border-[#ff8a63]/40 bg-[#ff8a63]/10 px-4 py-2 text-sm uppercase tracking-[0.25em] text-[#ffd7c7]"
        >
          {locale === "zh" ? "回到推荐" : "Back to recommendations"}
        </Link>
      </div>
    </main>
  );
}
