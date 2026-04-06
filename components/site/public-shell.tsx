import type { ReactNode } from "react";

import { PublicNav } from "@/components/site/public-nav";
import type { Locale } from "@/lib/i18n";

export function PublicShell({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return (
    <div className="min-h-screen bg-[#0d0b0a] text-[#f5efe6]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,106,61,0.2),transparent_32%),radial-gradient(circle_at_top_right,rgba(216,180,254,0.12),transparent_28%),linear-gradient(180deg,#0a0908_0%,#110f0d_55%,#18110e_100%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <PublicNav locale={locale} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
