import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/recommendations", label: "Recommendations" },
  { href: "/admin/shows", label: "Shows" },
  { href: "/admin/interviews", label: "Interviews" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/invites", label: "Invites" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto grid min-h-screen max-w-[96rem] gap-6 px-4 py-4 md:grid-cols-[18rem_minmax(0,1fr)] md:px-6 md:py-6">
        <aside className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(24,24,24,0.82)] p-5 backdrop-blur">
          <div className="space-y-2 border-b border-[var(--line)] pb-5">
            <p className="text-[0.7rem] uppercase tracking-[0.45em] text-[var(--muted)]">GBARUCTION</p>
            <h1 className="text-2xl font-black uppercase leading-none">Admin CMS</h1>
            <p className="text-sm leading-6 text-[var(--muted)]">
              A restrained editorial shell for collections, media, and site controls.
            </p>
          </div>
          <nav aria-label="Admin" className="mt-5 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 rounded-2xl border border-[var(--line)] bg-black/20 p-4 text-sm text-[var(--muted)]">
            Draft data is stored in memory for now so the shell can be exercised before the controller ships.
          </div>
        </aside>

        <main className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(24,24,24,0.72)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

