import { beforeEach, describe, expect, it, vi } from "vitest";

const createUploadUrlMock = vi.fn();
const requireAdminSessionMock = vi.fn();
const createMediaAssetRecordMock = vi.fn();
const getUploadedObjectMetadataMock = vi.fn();
const extractUploadedFileNameMock = vi.fn();
const buildPublicAssetUrlMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  AdminAuthError: class AdminAuthError extends Error {},
  AuthConfigurationError: class AuthConfigurationError extends Error {},
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/lib/storage/r2", () => ({
  createUploadUrl: createUploadUrlMock,
  getUploadedObjectMetadata: getUploadedObjectMetadataMock,
  extractUploadedFileName: extractUploadedFileNameMock,
  buildPublicAssetUrl: buildPublicAssetUrlMock,
  UploadObjectMissingError: class UploadObjectMissingError extends Error {},
  UploadObjectMetadataError: class UploadObjectMetadataError extends Error {},
}));

vi.mock("@/lib/queries/admin/media", () => ({
  createMediaAssetRecord: createMediaAssetRecordMock,
}));

describe("upload presign route", () => {
  beforeEach(() => {
    createUploadUrlMock.mockReset();
    requireAdminSessionMock.mockReset();
    createMediaAssetRecordMock.mockReset();
    getUploadedObjectMetadataMock.mockReset();
    extractUploadedFileNameMock.mockReset();
    buildPublicAssetUrlMock.mockReset();
  });

  it("rejects requests without an admin session", async () => {
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

  it("returns a signed url for authenticated admins without persisting an asset", async () => {
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
      fileName: "poster.png",
      contentType: "image/png",
      uploadUrl: "https://uploads.example.com/demo",
    });
    expect(createUploadUrlMock).toHaveBeenCalledWith(expect.stringContaining("poster.png"), "image/png");
    expect(createMediaAssetRecordMock).not.toHaveBeenCalled();
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

describe("upload finalize route", () => {
  beforeEach(() => {
    createUploadUrlMock.mockReset();
    requireAdminSessionMock.mockReset();
    createMediaAssetRecordMock.mockReset();
    getUploadedObjectMetadataMock.mockReset();
    extractUploadedFileNameMock.mockReset();
    buildPublicAssetUrlMock.mockReset();
  });

  it("creates a media asset from storage metadata after the object exists", async () => {
    requireAdminSessionMock.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com", role: "admin" },
      token: "session-token",
    });
    getUploadedObjectMetadataMock.mockResolvedValue({
      contentType: "image/png",
      byteSize: 1234,
    });
    extractUploadedFileNameMock.mockReturnValue("poster.png");
    buildPublicAssetUrlMock.mockReturnValue("https://cdn.example.com/uploads/poster.png");
    createMediaAssetRecordMock.mockResolvedValue({
      id: "asset-1",
      fileName: "poster.png",
      mimeType: "image/png",
      byteSize: 1234,
      objectKey: "uploads/poster.png",
      publicUrl: "https://cdn.example.com/uploads/poster.png",
      altText: "poster",
      kind: "image",
      createdAt: "2026-04-06T00:00:00.000Z",
    });

    const { POST } = await import("@/app/api/uploads/finalize/route");
    const response = await POST(
      new Request("http://localhost/api/uploads/finalize", {
        method: "POST",
        body: JSON.stringify({
          objectKey: "uploads/poster.png",
          altText: "poster",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      asset: {
        id: "asset-1",
        objectKey: "uploads/poster.png",
      },
    });
    expect(getUploadedObjectMetadataMock).toHaveBeenCalledWith("uploads/poster.png");
    expect(extractUploadedFileNameMock).toHaveBeenCalledWith("uploads/poster.png");
    expect(buildPublicAssetUrlMock).toHaveBeenCalledWith("uploads/poster.png");
    expect(createMediaAssetRecordMock).toHaveBeenCalledWith({
      fileName: "poster.png",
      mimeType: "image/png",
      byteSize: 1234,
      objectKey: "uploads/poster.png",
      publicUrl: "https://cdn.example.com/uploads/poster.png",
      altText: "poster",
    });
  });

  it("refuses to finalize uploads that are not present in storage yet", async () => {
    requireAdminSessionMock.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com", role: "admin" },
      token: "session-token",
    });
    const { UploadObjectMissingError } = await import("@/lib/storage/r2");
    getUploadedObjectMetadataMock.mockRejectedValue(new UploadObjectMissingError("uploads/missing.png"));

    const { POST } = await import("@/app/api/uploads/finalize/route");
    const response = await POST(
      new Request("http://localhost/api/uploads/finalize", {
        method: "POST",
        body: JSON.stringify({
          objectKey: "uploads/missing.png",
        }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "upload-not-found" });
    expect(createMediaAssetRecordMock).not.toHaveBeenCalled();
  });

  it("rejects uploads whose stored metadata is invalid", async () => {
    requireAdminSessionMock.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com", role: "admin" },
      token: "session-token",
    });
    const { UploadObjectMetadataError } = await import("@/lib/storage/r2");
    getUploadedObjectMetadataMock.mockRejectedValue(new UploadObjectMetadataError("uploads/bad-object.png"));

    const { POST } = await import("@/app/api/uploads/finalize/route");
    const response = await POST(
      new Request("http://localhost/api/uploads/finalize", {
        method: "POST",
        body: JSON.stringify({
          objectKey: "uploads/bad-object.png",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "invalid-upload-object" });
    expect(createMediaAssetRecordMock).not.toHaveBeenCalled();
  });

  it("rejects invalid finalize metadata", async () => {
    requireAdminSessionMock.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com", role: "admin" },
      token: "session-token",
    });

    const { POST } = await import("@/app/api/uploads/finalize/route");
    const response = await POST(
      new Request("http://localhost/api/uploads/finalize", {
        method: "POST",
        body: JSON.stringify({
          objectKey: "",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "invalid-upload-input" });
    expect(getUploadedObjectMetadataMock).not.toHaveBeenCalled();
    expect(createMediaAssetRecordMock).not.toHaveBeenCalled();
  });
});
