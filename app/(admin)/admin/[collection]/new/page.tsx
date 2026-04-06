import { notFound } from "next/navigation";

import { ContentEditor } from "@/components/admin/content-editor";
import { listMediaAssets } from "@/lib/queries/admin/media";
import { getAdminCollectionConfig, isAdminContentType } from "@/lib/queries/admin/content";

export default async function NewAdminContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ collection }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  if (!isAdminContentType(collection)) {
    notFound();
  }

  const [config, mediaAssets] = await Promise.all([Promise.resolve(getAdminCollectionConfig(collection)), listMediaAssets()]);

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
      record={null}
      mode="create"
      mediaAssets={mediaAssets}
      errorMessage={errorMessage}
      actionPath={`/admin/${collection}/new`}
    />
  );
}
