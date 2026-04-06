import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listAdminInvitesMock,
  getInviteByTokenMock,
  inviteComposerMock,
  notFoundMock,
} = vi.hoisted(() => {
  return {
    listAdminInvitesMock: vi.fn(),
    getInviteByTokenMock: vi.fn(),
    inviteComposerMock: vi.fn(() => createElement("div", null, "InviteComposer")),
    notFoundMock: vi.fn(),
  };
});

vi.mock("@/lib/auth", () => ({
  ADMIN_PASSWORD_MIN_LENGTH: 8,
  listAdminInvites: listAdminInvitesMock,
  getInviteByToken: getInviteByTokenMock,
  acceptAdminInvite: vi.fn(),
}));

vi.mock("@/components/admin/invite-composer", () => ({
  InviteComposer: inviteComposerMock,
}));

describe("invite read pages", () => {
  beforeEach(() => {
    listAdminInvitesMock.mockReset();
    getInviteByTokenMock.mockReset();
    inviteComposerMock.mockClear();
    notFoundMock.mockReset();
  });

  it("renders invite list links without needing the auth base URL", async () => {
    listAdminInvitesMock.mockResolvedValueOnce([
      {
        id: "invite-1",
        email: "writer@example.com",
        token: "secret-token",
        role: "admin",
        status: "pending",
        expiresAt: "2026-04-09T12:00:00.000Z",
        consumedAt: null,
        inviteUrl: "/admin/invite/secret-token",
      },
    ]);

    const { default: AdminInvitesPage } = await import("@/app/(admin)/admin/invites/page");
    const html = renderToStaticMarkup(await AdminInvitesPage());

    expect(html).toContain("/admin/invite/secret-token");
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("renders invite details without needing the auth base URL", async () => {
    getInviteByTokenMock.mockResolvedValueOnce({
      id: "invite-1",
      email: "writer@example.com",
      token: "secret-token",
      role: "admin",
      status: "pending",
      expiresAt: "2026-04-09T12:00:00.000Z",
      consumedAt: null,
      inviteUrl: "/admin/invite/secret-token",
    });

    const { default: AdminInviteAcceptPage } = await import("@/app/(auth)/admin/invite/[token]/page");
    const html = renderToStaticMarkup(
      await AdminInviteAcceptPage({
        params: Promise.resolve({ token: "secret-token" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(html).toContain("writer@example.com");
    expect(html).toContain("Activate account");
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
