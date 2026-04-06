import Link from "next/link";

import { loginAdminAction } from "@/lib/actions/admin/auth";

const copy = {
  invalid: "Email or password is incorrect.",
  reset: "Password updated. You can sign in with your new password.",
} as const;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const error = params.error === "invalid-credentials" ? copy.invalid : null;
  const notice = params.reset === "1" ? copy.reset : null;

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="space-y-5">
          <p className="text-xs uppercase tracking-[0.45em] text-[var(--muted)]">GBARUCTION</p>
          <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.92] md:text-7xl">
            Admin access for the editorial floor.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
            Sign in to manage recommendations, shows, interviews, site settings, and invite-only editorial access.
          </p>
        </section>

        <section className="rounded-[2rem] border border-[var(--line)] bg-[rgba(24,24,24,0.78)] p-6 backdrop-blur">
          <div className="space-y-2 border-b border-[var(--line)] pb-5">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Credentials</p>
            <h2 className="text-3xl font-black uppercase leading-none">Sign in</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Local fallback account: <span className="text-[var(--text)]">admin@example.com</span> /
              <span className="text-[var(--text)]"> gbaruction-admin</span>
            </p>
          </div>

          <form action={loginAdminAction} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Email</span>
              <input
                type="email"
                name="email"
                aria-label="Email"
                defaultValue="admin@example.com"
                className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Password</span>
              <input
                type="password"
                name="password"
                aria-label="Password"
                defaultValue="gbaruction-admin"
                className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
              />
            </label>

            {error ? <p className="rounded-2xl border border-[#ff8a63]/30 bg-[#ff8a63]/10 px-4 py-3 text-sm text-[#ffd5c4]">{error}</p> : null}
            {notice ? <p className="rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-[var(--text)]">{notice}</p> : null}

            <button
              type="submit"
              className="w-full rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#120a06]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-sm text-[var(--muted)]">
            Need a reset?{" "}
            <Link href="/admin/reset-password" className="text-[var(--text)] underline underline-offset-4">
              Request password reset
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
