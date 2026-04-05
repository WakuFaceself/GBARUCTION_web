import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPublicSiteSettings } from "@/lib/queries/public/site";

export default async function RootPage() {
  const [headerStore, cookieStore, settings] = await Promise.all([headers(), cookies(), getPublicSiteSettings()]);
  const localeCookie = cookieStore.get("gbaruction-locale")?.value;
  const acceptLanguage = headerStore.get("accept-language") ?? "";
  const locale =
    localeCookie === "zh" || localeCookie === "en"
      ? localeCookie
      : acceptLanguage.toLowerCase().startsWith("en")
        ? "en"
        : settings.defaultLocale;

  redirect(`/${locale}`);
}
