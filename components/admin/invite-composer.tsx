"use client";

import { useActionState } from "react";

import { createAdminInviteAction, type InviteComposerState } from "@/lib/actions/admin/auth";

export function InviteComposer() {
  const [state, action, pending] = useActionState<InviteComposerState, FormData>(createAdminInviteAction, {
    success: false,
    invite: null,
    emailPreview: null,
    error: null,
  });

  return (
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <h2 className="text-2xl font-bold">Invite members</h2>
        <button
          type="submit"
          form="invite-form"
          disabled={pending}
          className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#120a06] disabled:opacity-50"
        >
          {pending ? "Sending..." : "Send invite"}
        </button>
      </div>

      <form id="invite-form" action={action} className="mt-4 grid gap-4 md:grid-cols-2">
        <input
          name="email"
          placeholder="editor@example.com"
          className="rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
        />
        <select
          name="role"
          defaultValue="admin"
          className="rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
        >
          <option value="admin">admin</option>
        </select>
      </form>

      {state?.error ? <p className="mt-4 text-sm text-[#ffd5c4]">{state.error}</p> : null}
      {state?.invite ? (
        <div className="mt-4 rounded-2xl border border-[#ff8a63]/30 bg-[#ff8a63]/10 p-4 text-sm text-[#f7e1d4]">
          <p>Invite created for {state.invite.email}</p>
          <p className="mt-2 break-all">{state.invite.inviteUrl}</p>
          <p className="mt-2 text-xs text-[#ffd5c4]">
            Email preview subject: {state.emailPreview?.subject ?? "GBARUCTION admin invite"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
