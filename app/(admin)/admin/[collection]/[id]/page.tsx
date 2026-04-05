import { notFound } from "next/navigation";

import { ContentEditor } from "@/components/admin/content-editor";
import { getAdminCollectionConfig, getAdminContent, isAdminContentType } from "@/lib/queries/admin/content";

export default async function EditAdminContentPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection, id } = await params;

  if (!isAdminContentType(collection)) {
    notFound();
  }

  const config = getAdminCollectionConfig(collection);
  const record = await getAdminContent(collection, id);

  if (!record) {
    notFound();
  }

  return <ContentEditor type={collection} config={config} record={record} mode="edit" />;
}
