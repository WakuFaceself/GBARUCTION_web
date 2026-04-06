import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  AuthConfigurationError,
  listAdminInvitesMock,
  getInviteByTokenMock,
  inviteComposerMock,
  notFoundMock,
  redirectMock,
} = vi.hoisted(() => {
  class AuthConfigurationError extends Error {
    constructor(message = "Authentication storage is not configured") {
      super(message);
      this.name = "AuthConfigurationError";
    }
  }

  return {
    AuthConfigurationError,
    listAdminInvitesMock: vi.fn(),
    getInviteByTokenMock: vi.fn(),
    inviteComposerMock: vi.fn(() => createElement("div", null, "InviteComposer")),
    notFoundMock: vi.fn(),
    redirectMock: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  redirect: redirectMock,
}));

vi.mock("@/lib/auth", () => ({
  ADMIN_PASSWORD_MIN_LENGTH: 8,
  AuthConfigurationError,
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
    redirectMock.mockReset();
  });

  it("shows a controlled message when invite list URLs cannot be built", async () => {
    listAdminInvitesMock.mockRejectedValueOnce(new AuthConfigurationError("BETTER_AUTH_URL is required for admin email links."));

    const { default: AdminInvitesPage } = await import("@/app/(admin)/admin/invites/page");
    const html = renderToStaticMarkup(await AdminInvitesPage());

    expect(html).toContain("Invite links are temporarily unavailable.");
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("shows a controlled message when invite details cannot be loaded", async () => {
    getInviteByTokenMock.mockRejectedValueOnce(new AuthConfigurationError("BETTER_AUTH_URL is required for admin email links."));

    const { default: AdminInviteAcceptPage } = await import("@/app/(auth)/admin/invite/[token]/page");
    const html = renderToStaticMarkup(
      await AdminInviteAcceptPage({
        params: Promise.resolve({ token: "secret-token" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(html).toContain("Invite links are temporarily unavailable.");
    expect(html).toContain("Invite details are temporarily unavailable.");
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
