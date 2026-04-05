import type { Metadata } from "next";
import Link from "next/link";

import { ContentList } from "@/components/site/content-list";
import { getBrowseHighlights, searchPublicContent } from "@/lib/queries/public/content";
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

  return buildSiteMetadata(locale, "/search", locale === "zh" ? "搜索" : "Search");
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  if (!isLocale(locale)) {
    return null;
  }

  const query = resolvedSearchParams.q?.trim() ?? "";
  const results = query ? searchPublicContent(query, locale) : [];
  const highlights = getBrowseHighlights(locale);

  return (
    <main className="space-y-8 pb-16">
      <section className="border border-white/10 bg-white/5 p-5 lg:p-8">
        <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">
          {locale === "zh" ? "搜索" : "search"}
        </p>
        <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] sm:text-7xl">
          {locale === "zh" ? "搜索" : "Search"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#d9cabd]">
          {locale === "zh"
            ? "只搜索标题、摘要和标签，不扫描正文，确保浏览速度和编辑边界都稳定。"
            : "Search titles, summaries, and tags only. No body scanning, so browsing stays fast and the editorial boundary stays clear."}
        </p>
        <form className="mt-6 flex max-w-xl gap-3" action={`/${locale}/search`} method="get">
          <input
            aria-label={locale === "zh" ? "搜索内容" : "Search content"}
            name="q"
            defaultValue={query}
            placeholder={locale === "zh" ? "输入标题、摘要或标签" : "Search title, summary, or tag"}
            className="min-w-0 flex-1 border border-white/10 bg-black/30 px-4 py-3 text-sm text-[#f6eee3] outline-none placeholder:text-[#8f8173]"
          />
          <button
            type="submit"
            className="rounded-full border border-[#ff8a63]/40 bg-[#ff8a63]/10 px-5 py-3 text-sm uppercase tracking-[0.25em] text-[#ffd7c7]"
          >
            {locale === "zh" ? "搜索" : "Go"}
          </button>
        </form>
      </section>

      {query ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-sm text-[#d8cbbd]">
            <span>{locale === "zh" ? "结果" : "results"}</span>
            <span>{query}</span>
          </div>
          {results.length ? (
            <div className="grid gap-4">
              {results.map((item) => (
                <article
                  key={`${item.kind}-${item.slug}`}
                  className="border border-white/10 bg-white/5 p-4"
                >
                  <Link
                    href={`/${locale}/${item.kind === "recommendation" ? "recommend" : item.kind === "show" ? "shows" : "interviews"}/${item.slug}`}
                    className="text-2xl font-black uppercase tracking-[0.08em]"
                  >
                    {item.displayTitle}
                  </Link>
                  <p className="mt-2 text-sm leading-7 text-[#d9cabd]">
                    {item.displaySummary}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="border border-white/10 bg-white/5 p-4 text-sm text-[#d9cabd]">
              {locale === "zh"
                ? "没有找到匹配项。"
                : "No matches yet."}
            </p>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-[#9f9387]">
            {locale === "zh" ? "浏览建议" : "browse suggestions"}
          </p>
          <ContentList locale={locale} kind="recommendation" items={highlights.recommendations} />
        </section>
      )}
    </main>
  );
}
