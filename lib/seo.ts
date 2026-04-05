import type { Metadata } from "next";

import type { Locale } from "@/lib/i18n";

const siteName = "GBARUCTION";

const localeLabels: Record<Locale, { title: string; description: string }> = {
  zh: {
    title: "GBARUCTION",
    description: "独立乐迷的推荐、演出与采访入口。",
  },
  en: {
    title: "GBARUCTION",
    description: "An underground label site for recommendations, shows, and interviews.",
  },
};

export function buildSiteMetadata(locale: Locale, path: string, title?: string): Metadata {
  const label = localeLabels[locale];
  const pageTitle = title ? `${title} · ${siteName}` : siteName;
  const canonicalPath = `/${locale}${path === "/" ? "" : path}`;

  return {
    title: pageTitle,
    description: label.description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        zh: `/zh${path === "/" ? "" : path}`,
        en: `/en${path === "/" ? "" : path}`,
      },
    },
  };
}

export function buildContentMetadata(
  locale: Locale,
  path: string,
  item: {
    title: Record<Locale, string>;
    summary: Record<Locale, string>;
  },
): Metadata {
  const canonicalPath = `/${locale}${path}`;

  return {
    title: `${item.title[locale]} · ${siteName}`,
    description: item.summary[locale],
    alternates: {
      canonical: canonicalPath,
      languages: {
        zh: `/zh${path}`,
        en: `/en${path}`,
      },
    },
  };
}
