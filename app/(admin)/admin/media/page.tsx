export default function AdminMediaPage() {
  const assets = [
    { name: "cover-midnight-drive.jpg", kind: "image", status: "linked" },
    { name: "spring-circuit-poster.png", kind: "image", status: "queued" },
    { name: "interview-audio.mp3", kind: "audio", status: "linked" },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2 border-b border-[var(--line)] pb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Library</p>
        <h1 className="text-4xl font-black uppercase leading-none">Media</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          The media shelf is a placeholder for uploads, asset metadata, and future R2 integration.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <h2 className="text-2xl font-bold">Recent assets</h2>
            <button
              type="button"
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/5"
            >
              Upload asset
            </button>
          </div>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {assets.map((asset) => (
              <div key={asset.name} className="flex items-center justify-between py-4 text-sm">
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-[var(--muted)]">{asset.kind}</p>
                </div>
                <span className="text-[var(--muted)]">{asset.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <h2 className="text-2xl font-bold">Upload queue</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            The upload controller will eventually own presigned uploads and metadata edits.
          </p>
        </div>
      </div>
    </section>
  );
}

