import { beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();
const cookiesMock = vi.fn();
const createUploadUrlMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: headersMock,
  cookies: cookiesMock,
}));

vi.mock("@/lib/storage/r2", () => ({
  createUploadUrl: createUploadUrlMock,
}));

describe("upload presign route", () => {
  beforeEach(() => {
    headersMock.mockReset();
    cookiesMock.mockReset();
    createUploadUrlMock.mockReset();
  });

  it("rejects requests without an admin session header", async () => {
    headersMock.mockResolvedValue(new Headers());
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

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
    headersMock.mockResolvedValue(new Headers([["x-gbaruction-admin-session", "demo-admin"]]));
    cookiesMock.mockResolvedValue({
      get: () => undefined,
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
});
