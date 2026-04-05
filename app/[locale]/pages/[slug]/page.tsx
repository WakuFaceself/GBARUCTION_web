import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlockRenderer } from "@/lib/blocks/render";
import { isLocale } from "@/lib/i18n";
import { getManagedPage } from "@/lib/queries/public/content";
import { buildSiteMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const page = await getManagedPage(slug);
  const title = page ? page.item.title[locale] : slug;

  return buildSiteMetadata(locale, `/pages/${slug}`, title);
}

export default async function ManagedPageRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const page = await getManagedPage(slug);
  if (!page) {
    notFound();
  }

  return (
    <main className="space-y-8 pb-16 pt-4">
      <section className="space-y-4 border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.45em] text-[#d7c9ba]">
          {locale === "zh" ? "专题页面" : "managed page"}
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] sm:text-7xl">
          {page.item.title[locale]}
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-[#d9cabd]">{page.item.summary[locale]}</p>
      </section>

      <section className="border border-white/10 bg-black/20 p-5">
        <BlockRenderer
          locale={locale}
          bodyLanguage={page.item.bodyLanguage}
          blocks={page.item.bodyBlocks}
          className="space-y-4 text-base leading-8 text-[#efe3d6] [&_[data-body-language-notice]]:rounded [&_[data-body-language-notice]]:border [&_[data-body-language-notice]]:border-[#ff8a63]/30 [&_[data-body-language-notice]]:bg-[#ff8a63]/10 [&_[data-body-language-notice]]:px-3 [&_[data-body-language-notice]]:py-2 [&_[data-body-language-notice]]:text-sm [&_[data-body-language-notice]]:text-[#ffd5c4]"
        />
      </section>
    </main>
  );
}
