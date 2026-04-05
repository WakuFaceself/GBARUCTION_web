import { describe, expect, it } from "vitest";

import { acceptInvite } from "@/lib/auth";

describe("admin invite flow", () => {
  it("accepts invite only once", () => {
    const freshInvite = acceptInvite(null, new Date(Date.now() + 60_000));
    const reusedInvite = acceptInvite(new Date(), new Date(Date.now() + 60_000));

    expect(freshInvite).toEqual({ ok: true, inviteStatus: "accepted" });
    expect(reusedInvite).toEqual({ ok: false, reason: "invite-used" });
  });
});
