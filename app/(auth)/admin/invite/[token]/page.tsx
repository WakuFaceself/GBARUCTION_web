import { notFound, redirect } from "next/navigation";

import { acceptAdminInvite, getInviteByToken } from "@/lib/auth";

async function acceptInviteAction(formData: FormData) {
  "use server";

  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await acceptAdminInvite(token, password);
  if (!result.ok) {
    redirect(`/admin/invite/${token}?error=${result.reason}`);
  }

  redirect("/admin/login?created=1");
}

const errorCopy: Record<string, string> = {
  "invite-not-found": "Invite not found.",
  "invite-used": "This invite has already been used.",
  "invite-expired": "This invite has expired.",
};

export default async function AdminInviteAcceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ token }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const invite = await getInviteByToken(token);

  if (!invite) {
    notFound();
  }

  const error = resolvedSearchParams.error ? errorCopy[resolvedSearchParams.error] ?? "Invite could not be accepted." : null;

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--line)] bg-[rgba(24,24,24,0.78)] p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Invite only</p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-none">Accept admin invite</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          You are accepting access for <span className="text-[var(--text)]">{invite.email}</span>.
        </p>

        <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-black/20 p-4 text-sm text-[var(--muted)]">
          <p>Status: {invite.status}</p>
          <p>Expires: {new Date(invite.expiresAt).toLocaleString("en-US")}</p>
        </div>

        <form action={acceptInviteAction} className="mt-6 space-y-4">
          <input type="hidden" name="token" value={invite.token} />

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">New password</span>
            <input
              type="password"
              name="password"
              minLength={8}
              required
              className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
            />
          </label>

          {error ? <p className="rounded-2xl border border-[#ff8a63]/30 bg-[#ff8a63]/10 px-4 py-3 text-sm text-[#ffd5c4]">{error}</p> : null}

          <button
            type="submit"
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#120a06]"
          >
            Activate account
          </button>
        </form>
      </div>
    </main>
  );
}
