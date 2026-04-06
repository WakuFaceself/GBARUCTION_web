import { MediaUploader } from "@/components/admin/media-uploader";
import { listMediaAssets } from "@/lib/queries/admin/media";

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminMediaPage() {
  const assets = await listMediaAssets();

  return (
    <section className="space-y-6">
      <div className="space-y-2 border-b border-[var(--line)] pb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Library</p>
        <h1 className="text-4xl font-black uppercase leading-none">Media</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          The media library only stores assets after an upload has actually landed in R2, so queued presigns do not
          leave behind orphan records.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <h2 className="text-2xl font-bold">Recent assets</h2>
            <span className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)]">
              Auto-refresh after finalize
            </span>
          </div>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {assets.length ? assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between py-4 text-sm">
                <div>
                  <p className="font-medium">{asset.fileName}</p>
                  <p className="text-[var(--muted)]">
                    {asset.kind} · {asset.mimeType} · {formatSize(asset.byteSize)}
                  </p>
                  <p className="text-[0.75rem] text-[var(--muted)]">{asset.objectKey}</p>
                </div>
                <span className="text-[var(--muted)]">{asset.publicUrl ? "ready" : "stored"}</span>
              </div>
            )) : (
              <p className="py-4 text-sm text-[var(--muted)]">No assets yet. The first upload will appear here.</p>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <h2 className="text-2xl font-bold">Upload flow</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Uploads now follow a two-step contract: request a presigned URL first, then finalize the asset only after
            storage confirms the object exists.
          </p>
          <div className="mt-5 border-t border-[var(--line)] pt-5">
            <MediaUploader />
          </div>
        </div>
      </div>
    </section>
  );
}
