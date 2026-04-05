import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentDetail } from "@/components/site/content-detail";
import { getPublicItem } from "@/lib/queries/public/content";
import { buildContentMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const item = getPublicItem("recommendation", slug);

  if (!item) {
    return {};
  }

  return buildContentMetadata(locale, `/recommend/${slug}`, item);
}

export default async function RecommendDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const item = getPublicItem("recommendation", slug);

  if (!item) {
    notFound();
  }

  return (
    <main>
      <ContentDetail locale={locale} item={item} collection="recommend" />
    </main>
  );
}
