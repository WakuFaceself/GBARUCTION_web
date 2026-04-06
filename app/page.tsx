import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getPublicSiteSettings } from "@/lib/queries/public/site";

export default async function RootPage() {
  const [cookieStore, settings] = await Promise.all([cookies(), getPublicSiteSettings()]);
  const localeCookie = cookieStore.get("gbaruction-locale")?.value;
  const locale =
    localeCookie === "zh" || localeCookie === "en"
      ? localeCookie
      : settings.defaultLocale;

  redirect(`/${locale}`);
}
