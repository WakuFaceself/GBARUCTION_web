import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

const copy = {
  zh: {
    brand: "GBARUCTION",
    title: "策展之声",
    blurb: "独立乐迷的推荐、演出与采访入口。",
    switchLabel: "English",
    switchHref: "/en",
  },
  en: {
    brand: "GBARUCTION",
    title: "Curated Sounds",
    blurb: "A label magazine for recommendations, shows, and interviews.",
    switchLabel: "中文",
    switchHref: "/zh",
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

  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <nav className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <span className="text-sm font-semibold tracking-[0.3em]">{content.brand}</span>
        <Link href={content.switchHref} className="text-sm text-[var(--muted)]">
          {content.switchLabel}
        </Link>
      </nav>
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center gap-6 py-12">
        <p className="text-sm uppercase tracking-[0.35em] text-[var(--muted)]">Label magazine</p>
        <h1 className="max-w-3xl text-5xl font-black uppercase leading-none md:text-7xl">
          {content.title}
        </h1>
        <p className="max-w-xl text-lg text-[var(--muted)]">{content.blurb}</p>
      </section>
    </main>
  );
}
