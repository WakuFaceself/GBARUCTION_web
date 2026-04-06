import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAdminAction } from "@/lib/actions/admin/auth";
import type { AdminSession } from "@/lib/auth";

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

export function AdminShell({
  children,
  session,
}: {
  children: ReactNode;
  session: AdminSession;
}) {
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
          <div className="mt-6 space-y-4 rounded-2xl border border-[var(--line)] bg-black/20 p-4 text-sm text-[var(--muted)]">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--muted)]">Signed in</p>
              <p className="mt-2 font-medium text-[var(--text)]">{session.user.email}</p>
            </div>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text)] transition-colors hover:bg-white/5"
              >
                Sign out
              </button>
            </form>
            <p>
              Credentials auth is live now, while the rest of the admin controller continues to move from fixtures
              toward persisted content.
            </p>
          </div>
        </aside>

        <main className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(24,24,24,0.72)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
