import Link from "next/link";

import { getAdminDashboardSnapshot } from "@/lib/queries/admin/content";

export default async function AdminDashboardPage() {
  const snapshot = await getAdminDashboardSnapshot();

  return (
    <section className="space-y-8">
      <div className="space-y-3 border-b border-[var(--line)] pb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Overview</p>
        <h1 className="text-5xl font-black uppercase leading-none">Admin CMS</h1>
        <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Track editorial collections, keep drafts moving, and hand off a clean controller surface later.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total records", value: snapshot.totals.total },
          { label: "Drafts", value: snapshot.totals.draft },
          { label: "Published", value: snapshot.totals.published },
          { label: "Archived", value: snapshot.totals.archived },
        ].map((metric) => (
          <div key={metric.label} className="rounded-3xl border border-[var(--line)] bg-black/15 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{metric.label}</p>
            <p className="mt-4 text-4xl font-black">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Collections</p>
              <h2 className="mt-2 text-2xl font-bold">Fast access</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {snapshot.collections.map((collection) => (
              <Link
                key={collection.type}
                href={`/admin/${collection.type}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-sm transition-colors hover:bg-white/5"
              >
                <span>{collection.label}</span>
                <span className="text-[var(--muted)]">{collection.counts.total} items</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Recent</p>
              <h2 className="mt-2 text-2xl font-bold">Latest edits</h2>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {snapshot.recent.map((record) => (
              <Link
                key={`${record.collection}-${record.id}`}
                href={`/admin/${record.collection}/${record.id}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-sm transition-colors hover:bg-white/5"
              >
                <span className="max-w-[70%] truncate">{record.title}</span>
                <span className="text-[var(--muted)] capitalize">{record.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
