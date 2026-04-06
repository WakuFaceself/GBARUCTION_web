import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/site/public-shell";
import { isLocale } from "@/lib/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <PublicShell locale={locale}>{children}</PublicShell>;
}
