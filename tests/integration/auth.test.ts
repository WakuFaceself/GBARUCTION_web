import { beforeEach, describe, expect, it } from "vitest";

import {
  AuthConfigurationError,
  acceptAdminInvite,
  acceptInvite,
  createAdminInvite,
  createAdminSession,
  createPasswordResetToken,
  getAdminSessionCookieOptions,
  resetAdminPassword,
} from "@/lib/auth";

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
    const previousUrl = process.env.BETTER_AUTH_URL;
    process.env.BETTER_AUTH_URL = "https://admin.gbaruction.example";

    const invite = await createAdminInvite("writer@example.com");
    const accepted = await acceptAdminInvite(invite.token, "writer-password");
    const session = await createAdminSession("writer@example.com", "writer-password");

    if (previousUrl === undefined) {
      delete process.env.BETTER_AUTH_URL;
    } else {
      process.env.BETTER_AUTH_URL = previousUrl;
    }

    expect(accepted).toEqual({ ok: true, email: "writer@example.com" });
    expect(session?.user.email).toBe("writer@example.com");
  });

  it("builds absolute invite and reset URLs from the auth base URL", async () => {
    const previousUrl = process.env.BETTER_AUTH_URL;
    process.env.BETTER_AUTH_URL = "https://admin.gbaruction.example";
    globalThis.__gbaructionAuthStore = undefined;

    const invite = await createAdminInvite("writer@example.com");
    const reset = await createPasswordResetToken("admin@example.com");

    if (previousUrl === undefined) {
      delete process.env.BETTER_AUTH_URL;
    } else {
      process.env.BETTER_AUTH_URL = previousUrl;
    }

    expect(invite.inviteUrl).toBe(`https://admin.gbaruction.example/admin/invite/${invite.token}`);
    expect(reset?.resetUrl).toBe(`https://admin.gbaruction.example/admin/reset-password/${reset?.token}`);
  });

  it("rejects invite and reset URL generation when the auth base URL is missing", async () => {
    const previousUrl = process.env.BETTER_AUTH_URL;
    delete process.env.BETTER_AUTH_URL;
    globalThis.__gbaructionAuthStore = undefined;

    const inviteResult = createAdminInvite("writer@example.com");
    const resetResult = createPasswordResetToken("admin@example.com");

    if (previousUrl === undefined) {
      delete process.env.BETTER_AUTH_URL;
    } else {
      process.env.BETTER_AUTH_URL = previousUrl;
    }

    await expect(inviteResult).rejects.toBeInstanceOf(AuthConfigurationError);
    await expect(resetResult).rejects.toBeInstanceOf(AuthConfigurationError);
  });

  it("keeps forgot-password generic success for unknown emails when the auth base URL is missing", async () => {
    const previousUrl = process.env.BETTER_AUTH_URL;
    delete process.env.BETTER_AUTH_URL;
    globalThis.__gbaructionAuthStore = undefined;

    const reset = await createPasswordResetToken("missing@example.com");

    if (previousUrl === undefined) {
      delete process.env.BETTER_AUTH_URL;
    } else {
      process.env.BETTER_AUTH_URL = previousUrl;
    }

    expect(reset).toBeNull();
  });

  it("resets the seeded admin password and invalidates the old one", async () => {
    const previousUrl = process.env.BETTER_AUTH_URL;
    process.env.BETTER_AUTH_URL = "https://admin.gbaruction.example";

    const reset = await createPasswordResetToken("admin@example.com");
    const result = await resetAdminPassword(reset?.token ?? "", "new-admin-password");
    const staleSession = await createAdminSession("admin@example.com", "gbaruction-admin");
    const freshSession = await createAdminSession("admin@example.com", "new-admin-password");

    if (previousUrl === undefined) {
      delete process.env.BETTER_AUTH_URL;
    } else {
      process.env.BETTER_AUTH_URL = previousUrl;
    }

    expect(result).toEqual({ ok: true, email: "admin@example.com" });
    expect(staleSession).toBeNull();
    expect(freshSession?.user.email).toBe("admin@example.com");
  });

  it("marks auth cookies secure when the auth URL is https", () => {
    const previousUrl = process.env.BETTER_AUTH_URL;
    process.env.BETTER_AUTH_URL = "https://admin.gbaruction.example";

    const options = getAdminSessionCookieOptions(new Date("2026-04-05T00:00:00.000Z"));

    process.env.BETTER_AUTH_URL = previousUrl;

    expect(options.secure).toBe(true);
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
  });
});
