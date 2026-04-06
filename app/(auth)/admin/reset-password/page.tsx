import { requestPasswordResetAction } from "@/lib/actions/admin/auth";

const copy = {
  sent: "If the account exists, a reset link has been prepared.",
  error: "Email is required.",
  authConfigMissing: "Password reset links are temporarily unavailable.",
} as const;

export default async function AdminPasswordResetRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const notice = params.sent === "1" ? copy.sent : null;
  const error = params.error === "missing-email" ? copy.error : null;
  const configError = params.error === "auth-config-missing" ? copy.authConfigMissing : null;
  const mode = params.mode === "queued" ? "Resend queued the delivery." : params.mode ? "Preview mode active." : null;

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--line)] bg-[rgba(24,24,24,0.78)] p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Account recovery</p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-none">Request password reset</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Enter the admin email address and we will prepare a reset link. In local mode, the flow still succeeds without sending an actual email.
        </p>

        <form action={requestPasswordResetAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Email</span>
            <input
              type="email"
              name="email"
              aria-label="Reset email"
              defaultValue="admin@example.com"
              className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
            />
          </label>

          {error || configError ? (
            <p className="rounded-2xl border border-[#ff8a63]/30 bg-[#ff8a63]/10 px-4 py-3 text-sm text-[#ffd5c4]">
              {error ?? configError}
            </p>
          ) : null}
          {notice ? <p className="rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-[var(--text)]">{notice}</p> : null}
          {mode ? <p className="rounded-2xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm text-[var(--muted)]">{mode}</p> : null}

          <button
            type="submit"
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#120a06]"
          >
            Send reset link
          </button>
        </form>
      </div>
    </main>
  );
}
