import Link from "next/link";

import type { Locale } from "@/lib/i18n";

const copy = {
  zh: {
    brand: "GBARUCTION",
    links: [
      { label: "推荐", href: "/recommend" },
      { label: "演出", href: "/shows" },
      { label: "采访", href: "/interviews" },
      { label: "搜索", href: "/search" },
      { label: "海报实验室", href: "/poster-lab" },
    ],
    switchLabel: "English",
    switchHref: "/en",
  },
  en: {
    brand: "GBARUCTION",
    links: [
      { label: "Recommendations", href: "/recommend" },
      { label: "Shows", href: "/shows" },
      { label: "Interviews", href: "/interviews" },
      { label: "Search", href: "/search" },
      { label: "Poster Lab", href: "/poster-lab" },
    ],
    switchLabel: "中文",
    switchHref: "/zh",
  },
} as const;

export function PublicNav({ locale }: { locale: Locale }) {
  const nav = copy[locale];

  return (
    <header className="sticky top-0 z-20 mb-8 border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="flex min-w-0 flex-col gap-4 px-3 py-4 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[#d8cfc3]">
            label magazine
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex max-w-full flex-wrap items-center gap-3 text-2xl font-black uppercase tracking-[0.22em] [overflow-wrap:anywhere]"
          >
            <span className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-[0.7rem] tracking-[0.35em] text-[#ff8a63]">
              archive
            </span>
            {nav.brand}
          </Link>
        </div>
        <nav className="flex min-w-0 flex-wrap items-center gap-2 text-sm lg:justify-end">
          {nav.links.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className="max-w-full rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-[#f3eadf] transition [overflow-wrap:anywhere] hover:border-[#ff8a63]/60 hover:bg-[#ff8a63]/10"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={nav.switchHref}
            className="max-w-full rounded-full border border-[#ff8a63]/40 bg-[#ff8a63]/10 px-3 py-2 text-center text-[#ffcbb5] [overflow-wrap:anywhere]"
          >
            {nav.switchLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
