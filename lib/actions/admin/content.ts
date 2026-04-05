"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getAdminCollectionConfig,
  isAdminContentType,
  saveAdminContentRecord,
  type AdminContentStatus,
  type AdminContentType,
} from "@/lib/queries/admin/content";

function readFieldValues(type: AdminContentType, formData: FormData) {
  const config = getAdminCollectionConfig(type);

  return Object.fromEntries(
    config.fields.map((field) => {
      const value = formData.get(field.name);
      return [field.name, typeof value === "string" ? value : ""];
    })
  );
}

async function submitAdminContent(formData: FormData, status: AdminContentStatus) {
  const rawType = formData.get("type");
  const rawId = formData.get("id");

  if (typeof rawType !== "string" || !isAdminContentType(rawType)) {
    throw new Error("Invalid admin content type");
  }

  const fields = readFieldValues(rawType, formData);
  const record = saveAdminContentRecord({
    type: rawType,
    id: typeof rawId === "string" && rawId.length > 0 ? rawId : undefined,
    status,
    fields,
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/${rawType}`);
  revalidatePath(`/admin/${rawType}/${record.id}`);
  redirect(`/admin/${rawType}/${record.id}`);
}

export async function saveDraftAdminContentAction(formData: FormData) {
  await submitAdminContent(formData, "draft");
}

export async function publishAdminContentAction(formData: FormData) {
  await submitAdminContent(formData, "published");
}

export async function archiveAdminContentAction(formData: FormData) {
  await submitAdminContent(formData, "archived");
}

