import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminInviteAction } from "@/lib/actions/admin/auth";

const {
  cookiesMock,
  getAdminSessionMock,
  createAdminSessionMock,
  destroyAdminSessionMock,
  requireAdminSessionMock,
  createAdminInviteMock,
  acceptAdminInviteMock,
  createPasswordResetTokenMock,
  resetAdminPasswordMock,
  sendPasswordResetEmailMock,
  AuthConfigurationError,
} = vi.hoisted(() => {
  class AuthConfigurationError extends Error {
    constructor(message = "Authentication storage is not configured") {
      super(message);
      this.name = "AuthConfigurationError";
    }
  }

  return {
    cookiesMock: vi.fn(),
    getAdminSessionMock: vi.fn(),
    createAdminSessionMock: vi.fn(),
    destroyAdminSessionMock: vi.fn(),
    requireAdminSessionMock: vi.fn(),
    createAdminInviteMock: vi.fn(),
    acceptAdminInviteMock: vi.fn(),
    createPasswordResetTokenMock: vi.fn(),
    resetAdminPasswordMock: vi.fn(),
    sendPasswordResetEmailMock: vi.fn(),
    AuthConfigurationError,
  };
});

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/auth", () => ({
  ADMIN_SESSION_COOKIE: "gbaruction_admin_session",
  AuthConfigurationError,
  getAdminSession: getAdminSessionMock,
  createAdminSession: createAdminSessionMock,
  destroyAdminSession: destroyAdminSessionMock,
  createPasswordResetToken: createPasswordResetTokenMock,
  getAdminSessionCookieOptions: vi.fn(() => ({ httpOnly: true, sameSite: "lax", secure: false, path: "/" })),
  requireAdminSession: requireAdminSessionMock,
  resetAdminPassword: resetAdminPasswordMock,
  acceptAdminInvite: acceptAdminInviteMock,
  createAdminInvite: createAdminInviteMock,
}));

vi.mock("@/lib/email/resend", () => ({
  createInviteEmail: vi.fn(),
  sendInviteEmail: vi.fn(),
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

describe("auth api route", () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    getAdminSessionMock.mockReset();
    createAdminSessionMock.mockReset();
    destroyAdminSessionMock.mockReset();
    requireAdminSessionMock.mockReset();
    createAdminInviteMock.mockReset();
    acceptAdminInviteMock.mockReset();
    createPasswordResetTokenMock.mockReset();
    resetAdminPasswordMock.mockReset();
    sendPasswordResetEmailMock.mockReset();
    cookiesMock.mockResolvedValue({
      set: vi.fn(),
      delete: vi.fn(),
    });
  });

  it("forgot-password never returns reset details to the caller", async () => {
    createPasswordResetTokenMock.mockResolvedValue({
      email: "admin@example.com",
      token: "secret-token",
      expiresAt: new Date("2026-04-06T12:00:00.000Z"),
      resetUrl: "https://admin.gbaruction.example/admin/reset-password/secret-token",
    });
    sendPasswordResetEmailMock.mockResolvedValue({
      ok: true,
      deliveryId: "delivery-1",
      preview: {
        to: "admin@example.com",
        subject: "GBARUCTION password reset",
      },
    });

    const { POST } = await import("@/app/api/auth/[...all]/route");
    const response = await POST(
      new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "admin@example.com" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
      "admin@example.com",
      "https://admin.gbaruction.example/admin/reset-password/secret-token",
    );
  });

  it("forgot-password returns a controlled error when the auth base URL is missing", async () => {
    createPasswordResetTokenMock.mockRejectedValueOnce(new AuthConfigurationError("BETTER_AUTH_URL is required for admin email links."));

    const { POST } = await import("@/app/api/auth/[...all]/route");
    const response = await POST(
      new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "admin@example.com" }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "auth-config-missing" });
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });

  it("invite returns a controlled error when the auth base URL is missing", async () => {
    requireAdminSessionMock.mockResolvedValue(undefined);
    createAdminInviteMock.mockRejectedValueOnce(new AuthConfigurationError("BETTER_AUTH_URL is required for admin email links."));

    const { POST } = await import("@/app/api/auth/[...all]/route");
    const response = await POST(
      new Request("http://localhost/api/auth/invite", {
        method: "POST",
        body: JSON.stringify({ email: "writer@example.com", role: "admin" }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "auth-config-missing" });
  });

  it("invite action returns a controlled error when the auth base URL is missing", async () => {
    createAdminInviteMock.mockRejectedValueOnce(new AuthConfigurationError("BETTER_AUTH_URL is required for admin email links."));

    const result = await createAdminInviteAction(
      {
        success: false,
        invite: null,
        emailPreview: null,
        delivery: null,
        error: null,
      },
      (() => {
        const formData = new FormData();
        formData.set("email", "writer@example.com");
        formData.set("role", "admin");
        return formData;
      })(),
    );

    expect(result).toEqual({
      success: false,
      invite: null,
      emailPreview: null,
      delivery: null,
      error: "Invite links are temporarily unavailable.",
    });
  });

  it("invite accept returns a password length error", async () => {
    acceptAdminInviteMock.mockResolvedValueOnce({
      ok: false,
      reason: "password-too-short",
    });

    const { POST } = await import("@/app/api/auth/[...all]/route");
    const response = await POST(
      new Request("http://localhost/api/auth/invite/accept", {
        method: "POST",
        body: JSON.stringify({ token: "token-1", password: "short" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "password-too-short" });
  });

  it("reset-password returns a password length error", async () => {
    resetAdminPasswordMock.mockResolvedValueOnce({
      ok: false,
      reason: "password-too-short",
    });

    const { POST } = await import("@/app/api/auth/[...all]/route");
    const response = await POST(
      new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: "token-1", password: "short" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "password-too-short" });
  });
});
