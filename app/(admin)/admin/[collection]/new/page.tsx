import { notFound } from "next/navigation";

import { ContentEditor } from "@/components/admin/content-editor";
import { getAdminCollectionConfig, isAdminContentType } from "@/lib/queries/admin/content";

export default async function NewAdminContentPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;

  if (!isAdminContentType(collection)) {
    notFound();
  }

  const config = getAdminCollectionConfig(collection);

  return <ContentEditor type={collection} config={config} record={null} mode="create" />;
}

