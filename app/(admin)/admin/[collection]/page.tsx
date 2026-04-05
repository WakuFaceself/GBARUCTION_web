import { notFound } from "next/navigation";

import { ContentIndex } from "@/components/admin/content-index";
import {
  getAdminCollectionConfig,
  isAdminContentType,
  listAdminContent,
} from "@/lib/queries/admin/content";

export default async function AdminCollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;

  if (!isAdminContentType(collection)) {
    notFound();
  }

  const config = getAdminCollectionConfig(collection);
  const records = listAdminContent(collection);

  return <ContentIndex type={collection} config={config} records={records} />;
}

