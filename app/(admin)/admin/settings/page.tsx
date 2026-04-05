import { saveSiteSettingsAction } from "@/lib/actions/admin/settings";
import { getSiteSettingsRecord } from "@/lib/queries/admin/settings";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [settings, params] = await Promise.all([getSiteSettingsRecord(), searchParams]);
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
            These values now persist into `site_settings.global`. The homepage consumes them without changing the route structure.
          </p>
        </div>
      </div>
    </section>
  );
}
