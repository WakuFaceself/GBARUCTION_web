import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();
const getAdminSessionMock = vi.fn();
const createAdminSessionMock = vi.fn();
const destroyAdminSessionMock = vi.fn();
const createPasswordResetTokenMock = vi.fn();
const sendPasswordResetEmailMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/auth", () => ({
  ADMIN_SESSION_COOKIE: "gbaruction_admin_session",
  getAdminSession: getAdminSessionMock,
  createAdminSession: createAdminSessionMock,
  destroyAdminSession: destroyAdminSessionMock,
  createPasswordResetToken: createPasswordResetTokenMock,
  getAdminSessionCookieOptions: vi.fn(() => ({ httpOnly: true, sameSite: "lax", secure: false, path: "/" })),
  requireAdminSession: vi.fn(),
  resetAdminPassword: vi.fn(),
  acceptAdminInvite: vi.fn(),
  createAdminInvite: vi.fn(),
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
    createPasswordResetTokenMock.mockReset();
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
});
