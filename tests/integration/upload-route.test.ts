import { beforeEach, describe, expect, it, vi } from "vitest";

const createUploadUrlMock = vi.fn();
const requireAdminSessionMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  AdminAuthError: class AdminAuthError extends Error {},
  AuthConfigurationError: class AuthConfigurationError extends Error {},
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/lib/storage/r2", () => ({
  createUploadUrl: createUploadUrlMock,
}));

describe("upload presign route", () => {
  beforeEach(() => {
    createUploadUrlMock.mockReset();
    requireAdminSessionMock.mockReset();
  });

  it("rejects requests without an admin session header", async () => {
    const { AdminAuthError } = await import("@/lib/auth");
    requireAdminSessionMock.mockRejectedValue(new AdminAuthError());

    const { POST } = await import("@/app/api/uploads/presign/route");
    const response = await POST(
      new Request("http://localhost/api/uploads/presign", {
        method: "POST",
        body: JSON.stringify({ fileName: "poster.png", contentType: "image/png" }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "unauthorized" });
    expect(createUploadUrlMock).not.toHaveBeenCalled();
  });

  it("returns a signed url for authenticated admins", async () => {
    requireAdminSessionMock.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com", role: "admin" },
      token: "session-token",
    });
    createUploadUrlMock.mockResolvedValue("https://uploads.example.com/demo");

    const { POST } = await import("@/app/api/uploads/presign/route");
    const response = await POST(
      new Request("http://localhost/api/uploads/presign", {
        method: "POST",
        body: JSON.stringify({ fileName: "poster.png", contentType: "image/png" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      asset: {
        fileName: "poster.png",
        mimeType: "image/png",
      },
      uploadUrl: "https://uploads.example.com/demo",
    });
    expect(createUploadUrlMock).toHaveBeenCalledWith(expect.stringContaining("poster.png"), "image/png");
  });

  it("rejects invalid upload metadata", async () => {
    requireAdminSessionMock.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com", role: "admin" },
      token: "session-token",
    });

    const { POST } = await import("@/app/api/uploads/presign/route");
    const response = await POST(
      new Request("http://localhost/api/uploads/presign", {
        method: "POST",
        body: JSON.stringify({ fileName: "../poster.png", contentType: "application/pdf", byteSize: 99_999_999 }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "invalid-upload-input" });
    expect(createUploadUrlMock).not.toHaveBeenCalled();
  });
});
