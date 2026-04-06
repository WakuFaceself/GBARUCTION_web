import { notFound } from "next/navigation";

import { ContentEditor } from "@/components/admin/content-editor";
import { listMediaAssets } from "@/lib/queries/admin/media";
import { getAdminCollectionConfig, getAdminContent, isAdminContentType } from "@/lib/queries/admin/content";

export default async function EditAdminContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ collection, id }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  if (!isAdminContentType(collection)) {
    notFound();
  }

  const [config, record, mediaAssets] = await Promise.all([
    Promise.resolve(getAdminCollectionConfig(collection)),
    getAdminContent(collection, id),
    listMediaAssets(),
  ]);

  if (!record) {
    notFound();
  }

  const errorMessage =
    resolvedSearchParams.error === "slug-conflict"
      ? "This slug is already in use for the current collection."
      : resolvedSearchParams.error === "invalid-cover-asset"
        ? "The selected cover asset could not be found."
        : resolvedSearchParams.error === "invalid-body-blocks"
          ? "Body blocks must be valid JSON that matches the shared block schema."
        : resolvedSearchParams.error === "slug-required"
          ? "Slug is required before saving."
          : null;

  return (
    <ContentEditor
      type={collection}
      config={config}
      record={record}
      mode="edit"
      mediaAssets={mediaAssets}
      errorMessage={errorMessage}
      actionPath={`/admin/${collection}/${id}`}
    />
  );
}
