export default function AdminInvitesPage() {
  const invites = [
    { email: "editor@example.com", role: "admin", status: "pending" },
    { email: "writer@example.com", role: "editor", status: "accepted" },
    { email: "ops@example.com", role: "admin", status: "expired" },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2 border-b border-[var(--line)] pb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Access</p>
        <h1 className="text-4xl font-black uppercase leading-none">Invites</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Invite management is rendered as a working shell so role and acceptance flows can be wired in later.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <h2 className="text-2xl font-bold">Invite members</h2>
            <button
              type="button"
              className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#120a06]"
            >
              Send invite
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              placeholder="editor@example.com"
              className="rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
            <select className="rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]">
              <option>admin</option>
              <option>editor</option>
              <option>writer</option>
            </select>
          </div>
          <div className="mt-5 divide-y divide-[var(--line)]">
            {invites.map((invite) => (
              <div key={invite.email} className="flex items-center justify-between py-4 text-sm">
                <div>
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-[var(--muted)]">{invite.role}</p>
                </div>
                <span className="text-[var(--muted)]">{invite.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line)] bg-black/15 p-5">
          <h2 className="text-2xl font-bold">Access policy</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            The controller can swap in invite persistence and consumption tracking without changing the page shell.
          </p>
        </div>
      </div>
    </section>
  );
}

