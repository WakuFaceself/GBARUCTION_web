import Link from "next/link";

import type {
  AdminCollectionConfig,
  AdminContentRecord,
  AdminContentType,
} from "@/lib/queries/admin/content";

function statusClassName(status: AdminContentRecord["status"]) {
  switch (status) {
    case "published":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "archived":
      return "border-[var(--line)] bg-white/5 text-[var(--muted)]";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  }
}

export function ContentIndex({
  type,
  config,
  records,
}: {
  type: AdminContentType;
  config: AdminCollectionConfig;
  records: AdminContentRecord[];
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Collection</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-black uppercase leading-none">{config.label}</h1>
            <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
              {records.length} items
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">{config.description}</p>
        </div>
        <Link
          href={`/admin/${type}/new`}
          className="inline-flex items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#120a06] transition-colors hover:bg-[#ff7b53]"
        >
          {config.newLabel}
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Draft", value: records.filter((record) => record.status === "draft").length },
          {
            label: "Published",
            value: records.filter((record) => record.status === "published").length,
          },
          {
            label: "Archived",
            value: records.filter((record) => record.status === "archived").length,
          },
        ].map((metric) => (
          <div key={metric.label} className="rounded-3xl border border-[var(--line)] bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{metric.label}</p>
            <p className="mt-3 text-3xl font-black">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-[var(--line)]">
        <div className="border-b border-[var(--line)] bg-black/20 px-5 py-4">
          <p className="text-sm text-[var(--muted)]">Latest records and their current status.</p>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_auto] lg:items-center">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold">{record.title}</h2>
                    <span className={`rounded-full border px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] ${statusClassName(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{record.summary || "No summary yet."}</p>
                </div>
                <div className="text-sm text-[var(--muted)]">
                  <p className="uppercase tracking-[0.25em] text-[0.7rem]">Slug</p>
                  <p className="mt-1">{record.slug}</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/${type}/${record.id}`}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-sm text-[var(--muted)]">Nothing here yet. Start with a new record.</div>
          )}
        </div>
      </div>
    </section>
  );
}

