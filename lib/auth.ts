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
  return {
    user: {
      id: "demo-admin",
      email: "admin@example.com",
      role: "admin",
    },
  };
}
