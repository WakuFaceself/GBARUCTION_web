import { saveSiteSettingsAction } from "@/lib/actions/admin/settings";
import { getSiteSettingsHomeRecord, getSiteSettingsRecord } from "@/lib/queries/admin/settings";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [settings, home, params] = await Promise.all([getSiteSettingsRecord(), getSiteSettingsHomeRecord(), searchParams]);
  const saved = params.saved === "1";

  return (
    <section className="space-y-6">
      <div className="space-y-2 border-b border-[var(--line)] pb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Configuration</p>
        <h1 className="text-4xl font-black uppercase leading-none">Settings</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Site-level settings now persist and drive the homepage shell, default locale preference, and editorial framing copy.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form action={saveSiteSettingsAction} className="space-y-4 rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Site title</span>
              <input
                name="siteTitle"
                defaultValue={settings.siteTitle}
                className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Default locale</span>
              <select
                name="defaultLocale"
                defaultValue={settings.defaultLocale}
                className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
              >
                <option value="zh">zh</option>
                <option value="en">en</option>
              </select>
            </label>
          </div>
          <label className="space-y-2">
            <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Editorial note</span>
            <textarea
              name="editorialNote"
              rows={5}
              defaultValue={settings.editorialNote}
              className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>
          <div className="space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-black/10 p-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Homepage curation</p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                One slug per line. The list order becomes the homepage order.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Hero slug</span>
                <input
                  name="heroSlug"
                  defaultValue={home.heroSlug}
                  className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="space-y-2">
                <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Poster lab slug</span>
                <input
                  name="posterLabSlug"
                  defaultValue={home.posterLabSlug}
                  className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                />
              </label>
            </div>
            <label className="space-y-2">
              <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Recommendations</span>
              <textarea
                name="recommendations"
                rows={4}
                defaultValue={home.recommendations.join("\n")}
                className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                placeholder="slug-one\nslug-two"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Shows</span>
              <textarea
                name="shows"
                rows={4}
                defaultValue={home.shows.join("\n")}
                className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                placeholder="show-one\nshow-two"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Interviews</span>
              <textarea
                name="interviews"
                rows={4}
                defaultValue={home.interviews.join("\n")}
                className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
                placeholder="interview-one\ninterview-two"
              />
            </label>
          </div>
          {saved ? (
            <p className="rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-[var(--text)]">
              Settings saved and homepage cache refreshed.
            </p>
          ) : null}
          <button
            type="submit"
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#120a06]"
          >
            Save settings
          </button>
        </form>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <h2 className="text-2xl font-bold">Controller notes</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Global fields persist into `site_settings.global`. Homepage curation persists into `site_settings.home` and drives public ordering.
          </p>
        </div>
      </div>
    </section>
  );
}
