import { headers } from "next/headers";

export type AdminSession = {
  user: {
    id: string;
    email: string;
    role: "admin";
  };
};

export type InviteAcceptanceResult =
  | { ok: true; inviteStatus: "accepted" }
  | { ok: false; reason: "invite-used" | "invite-expired" };

export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export function acceptInvite(consumedAt: Date | null, expiresAt: Date): InviteAcceptanceResult {
  if (consumedAt) {
    return { ok: false, reason: "invite-used" };
  }

  if (expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "invite-expired" };
  }

  return { ok: true, inviteStatus: "accepted" };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const headerStore = await headers();
  const sessionToken = headerStore.get("x-gbaruction-admin-session");

  if (sessionToken !== "demo-admin") {
    throw new AdminAuthError();
  }

  return {
    user: {
      id: "demo-admin",
      email: "admin@example.com",
      role: "admin",
    },
  };
}
