"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { saveSiteSettingsRecord } from "@/lib/queries/admin/settings";

export async function saveSiteSettingsAction(formData: FormData) {
  const siteTitle = String(formData.get("siteTitle") ?? "").trim();
  const defaultLocale = formData.get("defaultLocale") === "en" ? "en" : "zh";
  const editorialNote = String(formData.get("editorialNote") ?? "").trim();

  await saveSiteSettingsRecord({
    siteTitle: siteTitle || "GBARUCTION",
    defaultLocale,
    editorialNote: editorialNote || "Editorial defaults, syndication preferences, and controller-ready flags.",
  });

  revalidatePath("/");
  revalidatePath("/zh");
  revalidatePath("/en");
  revalidatePath("/admin/settings");

  redirect("/admin/settings?saved=1");
}
