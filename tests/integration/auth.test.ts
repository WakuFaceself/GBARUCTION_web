import { beforeEach, describe, expect, it } from "vitest";

import { acceptAdminInvite, acceptInvite, createAdminInvite, createAdminSession } from "@/lib/auth";

describe("admin invite flow", () => {
  beforeEach(() => {
    globalThis.__gbaructionAuthStore = undefined;
  });

  it("accepts invite only once", () => {
    const freshInvite = acceptInvite(null, new Date(Date.now() + 60_000));
    const reusedInvite = acceptInvite(new Date(), new Date(Date.now() + 60_000));

    expect(freshInvite).toEqual({ ok: true, inviteStatus: "accepted" });
    expect(reusedInvite).toEqual({ ok: false, reason: "invite-used" });
  });

  it("rejects expired invites", () => {
    const expiredInvite = acceptInvite(null, new Date(Date.now() - 60_000));

    expect(expiredInvite).toEqual({ ok: false, reason: "invite-expired" });
  });

  it("creates a fallback session for the seeded admin user", async () => {
    const session = await createAdminSession("admin@example.com", "gbaruction-admin");

    expect(session?.user.email).toBe("admin@example.com");
    expect(session?.token).toBeTruthy();
  });

  it("accepts an invite and lets the invited admin sign in", async () => {
    const invite = await createAdminInvite("writer@example.com");
    const accepted = await acceptAdminInvite(invite.token, "writer-password");
    const session = await createAdminSession("writer@example.com", "writer-password");

    expect(accepted).toEqual({ ok: true, email: "writer@example.com" });
    expect(session?.user.email).toBe("writer@example.com");
  });
});
