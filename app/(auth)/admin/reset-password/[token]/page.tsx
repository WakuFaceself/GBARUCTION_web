import { notFound } from "next/navigation";

import { resetPasswordAction } from "@/lib/actions/admin/auth";
import { ADMIN_PASSWORD_MIN_LENGTH, getPasswordResetTokenRecord } from "@/lib/auth";

const errorCopy: Record<string, string> = {
  "token-not-found": "Reset link is invalid.",
  "token-expired": "Reset link has expired.",
  "password-too-short": `Password must be at least ${ADMIN_PASSWORD_MIN_LENGTH} characters.`,
};

export default async function AdminPasswordResetPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ token }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const record = await getPasswordResetTokenRecord(token);

  if (!record) {
    notFound();
  }

  const error = resolvedSearchParams.error ? errorCopy[resolvedSearchParams.error] ?? "Password reset failed." : null;

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--line)] bg-[rgba(24,24,24,0.78)] p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Account recovery</p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-none">Reset password</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Resetting access for <span className="text-[var(--text)]">{record.email}</span>.
        </p>

        <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-black/20 p-4 text-sm text-[var(--muted)]">
          <p>Status: {record.isExpired ? "expired" : "active"}</p>
          <p>Expires: {record.expiresAt.toLocaleString("en-US")}</p>
        </div>

        <form action={resetPasswordAction} className="mt-6 space-y-4">
          <input type="hidden" name="token" value={record.token} />

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">New password</span>
            <input
              type="password"
              name="password"
              minLength={ADMIN_PASSWORD_MIN_LENGTH}
              required
              className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
            />
          </label>

          {error ? <p className="rounded-2xl border border-[#ff8a63]/30 bg-[#ff8a63]/10 px-4 py-3 text-sm text-[#ffd5c4]">{error}</p> : null}

          <button
            type="submit"
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#120a06]"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
