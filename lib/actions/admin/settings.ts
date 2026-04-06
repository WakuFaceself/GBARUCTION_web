"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { saveSiteSettingsHomeRecord, saveSiteSettingsRecord } from "@/lib/queries/admin/settings";

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readSlugLines(formData: FormData, key: string) {
  const lines = String(formData.get(key) ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return Array.from(new Set(lines));
}

export async function saveSiteSettingsAction(formData: FormData) {
  const siteTitle = readText(formData, "siteTitle");
  const defaultLocale = formData.get("defaultLocale") === "en" ? "en" : "zh";
  const editorialNote = readText(formData, "editorialNote");
  const heroSlug = readText(formData, "heroSlug") || undefined;
  const posterLabSlug = readText(formData, "posterLabSlug") || "poster-lab";

  await Promise.all([
    saveSiteSettingsRecord({
      siteTitle: siteTitle || "GBARUCTION",
      defaultLocale,
      editorialNote: editorialNote || "Editorial defaults, syndication preferences, and controller-ready flags.",
    }),
    saveSiteSettingsHomeRecord({
      heroSlug,
      recommendations: readSlugLines(formData, "recommendations"),
      shows: readSlugLines(formData, "shows"),
      interviews: readSlugLines(formData, "interviews"),
      posterLabSlug,
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/zh");
  revalidatePath("/en");
  revalidatePath("/admin/settings");

  redirect("/admin/settings?saved=1");
}
