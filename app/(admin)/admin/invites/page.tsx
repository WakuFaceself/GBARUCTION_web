import React from "react";

import { InviteComposer } from "@/components/admin/invite-composer";
import { AuthConfigurationError, type AdminInviteRecord, listAdminInvites } from "@/lib/auth";

export default async function AdminInvitesPage() {
  let invites: AdminInviteRecord[] = [];
  let configError: string | null = null;

  try {
    invites = await listAdminInvites();
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      configError = "Invite links are temporarily unavailable.";
    } else {
      throw error;
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2 border-b border-[var(--line)] pb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Access</p>
        <h1 className="text-4xl font-black uppercase leading-none">Invites</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Invite management is now live enough to mint real tokens, preview the outbound email payload, and accept
          access through the invite URL.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <InviteComposer />
          {configError ? (
            <p className="rounded-2xl border border-[#ff8a63]/30 bg-[#ff8a63]/10 px-4 py-3 text-sm text-[#ffd5c4]">
              {configError}
            </p>
          ) : null}
          <div className="mt-5 divide-y divide-[var(--line)]">
            {invites.map((invite) => (
              <div key={invite.email} className="flex items-center justify-between py-4 text-sm">
                <div>
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-[var(--muted)]">{invite.role}</p>
                  <p className="text-[0.75rem] text-[var(--muted)]">{invite.inviteUrl}</p>
                </div>
                <span className="text-[var(--muted)]">{invite.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <h2 className="text-2xl font-bold">Access policy</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Access stays invite-only. Accepted invites can update an existing account password or create a new admin
            account from scratch.
          </p>
        </div>
      </div>
    </section>
  );
}
