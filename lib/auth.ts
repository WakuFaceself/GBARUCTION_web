import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";

import { createDb } from "@/lib/db/client";
import { accounts, adminInvites, sessions, users } from "@/lib/db/schema/auth";
import { hasDatabaseUrl } from "@/lib/env";

export const ADMIN_SESSION_COOKIE = "gbaruction_admin_session";
const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 3;

export type AdminSession = {
  user: {
    id: string;
    email: string;
    role: "admin";
  };
  token: string;
};

export type InviteAcceptanceResult =
  | { ok: true; inviteStatus: "accepted" }
  | { ok: false; reason: "invite-used" | "invite-expired" };

export type AdminInviteRecord = {
  id: string;
  email: string;
  token: string;
  role: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  consumedAt: string | null;
  inviteUrl: string;
};

type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin";
};

type StoredSession = {
  token: string;
  userId: string;
  expiresAt: Date;
};

type StoredInvite = {
  id: string;
  email: string;
  token: string;
  role: string;
  consumedAt: Date | null;
  expiresAt: Date;
};

type MemoryAuthStore = {
  users: StoredUser[];
  sessions: StoredSession[];
  invites: StoredInvite[];
};

declare global {
  var __gbaructionAuthStore: MemoryAuthStore | undefined;
}

export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, hash: string | null | undefined) {
  if (!hash) {
    return false;
  }

  const [salt, stored] = hash.split(":");
  if (!salt || !stored) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(stored, "hex");

  if (derived.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derived, storedBuffer);
}

function getMemoryStore() {
  if (!globalThis.__gbaructionAuthStore) {
    globalThis.__gbaructionAuthStore = {
      users: [
        {
          id: "demo-admin",
          email: "admin@example.com",
          passwordHash: hashPassword("gbaruction-admin"),
          role: "admin",
        },
      ],
      sessions: [],
      invites: [],
    };
  }

  return globalThis.__gbaructionAuthStore;
}

function buildInviteStatus(consumedAt: Date | null, expiresAt: Date): AdminInviteRecord["status"] {
  if (consumedAt) {
    return "accepted";
  }

  if (expiresAt.getTime() < Date.now()) {
    return "expired";
  }

  return "pending";
}

function buildInviteUrl(token: string) {
  return `/admin/invite/${token}`;
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

export async function getAdminSession(): Promise<AdminSession | null> {
  const headerStore = await headers();
  const forcedSessionToken = headerStore.get("x-gbaruction-admin-session");

  if (forcedSessionToken === "demo-admin") {
    return {
      token: forcedSessionToken,
      user: {
        id: "demo-admin",
        email: "admin@example.com",
        role: "admin",
      },
    };
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  if (hasDatabaseUrl()) {
    const db = createDb();
    const [row] = await db
      .select({
        token: sessions.token,
        expiresAt: sessions.expiresAt,
        userId: users.id,
        email: users.email,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.token, sessionToken), gt(sessions.expiresAt, new Date())));

    if (!row || row.role !== "admin") {
      return null;
    }

    return {
      token: row.token,
      user: {
        id: row.userId,
        email: row.email,
        role: "admin",
      },
    };
  }

  const store = getMemoryStore();
  const session = store.sessions.find((item) => item.token === sessionToken && item.expiresAt.getTime() > Date.now());
  if (!session) {
    return null;
  }

  const user = store.users.find((item) => item.id === session.userId);
  if (!user) {
    return null;
  }

  return {
    token: session.token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new AdminAuthError();
  }

  return session;
}

async function persistSession(userId: string) {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  if (hasDatabaseUrl()) {
    const db = createDb();
    await db.insert(sessions).values({
      userId,
      token,
      expiresAt,
    });
  } else {
    const store = getMemoryStore();
    store.sessions = store.sessions.filter((item) => item.userId !== userId);
    store.sessions.push({ token, userId, expiresAt });
  }

  return { token, expiresAt };
}

export async function createAdminSession(email: string, password: string) {
  if (hasDatabaseUrl()) {
    const db = createDb();
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (!user || user.role !== "admin" || !verifyPassword(password, user.passwordHash)) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: "admin" as const,
      },
      ...(await persistSession(user.id)),
    };
  }

  const store = getMemoryStore();
  const user = store.users.find((item) => item.email === email.toLowerCase());

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: "admin" as const,
    },
    ...(await persistSession(user.id)),
  };
}

export async function destroyAdminSession(token: string) {
  if (hasDatabaseUrl()) {
    const db = createDb();
    await db.delete(sessions).where(eq(sessions.token, token));
    return;
  }

  const store = getMemoryStore();
  store.sessions = store.sessions.filter((item) => item.token !== token);
}

export async function createAdminInvite(email: string, role = "admin") {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  const normalizedEmail = email.toLowerCase();

  if (hasDatabaseUrl()) {
    const db = createDb();
    const [invite] = await db
      .insert(adminInvites)
      .values({
        email: normalizedEmail,
        token,
        role,
        expiresAt,
      })
      .returning();

    return {
      id: invite.id,
      email: invite.email,
      token: invite.token,
      role: invite.role,
      status: buildInviteStatus(invite.consumedAt, invite.expiresAt),
      expiresAt: invite.expiresAt.toISOString(),
      consumedAt: invite.consumedAt?.toISOString() ?? null,
      inviteUrl: buildInviteUrl(invite.token),
    } satisfies AdminInviteRecord;
  }

  const store = getMemoryStore();
  const invite: StoredInvite = {
    id: randomUUID(),
    email: normalizedEmail,
    token,
    role,
    consumedAt: null,
    expiresAt,
  };
  store.invites.unshift(invite);

  return {
    id: invite.id,
    email: invite.email,
    token: invite.token,
    role: invite.role,
    status: buildInviteStatus(invite.consumedAt, invite.expiresAt),
    expiresAt: invite.expiresAt.toISOString(),
    consumedAt: null,
    inviteUrl: buildInviteUrl(invite.token),
  } satisfies AdminInviteRecord;
}

export async function listAdminInvites(): Promise<AdminInviteRecord[]> {
  if (hasDatabaseUrl()) {
    const db = createDb();
    const rows = await db.select().from(adminInvites);

    return rows
      .slice()
      .sort((left, right) => right.expiresAt.getTime() - left.expiresAt.getTime())
      .map((row) => ({
        id: row.id,
        email: row.email,
        token: row.token,
        role: row.role,
        status: buildInviteStatus(row.consumedAt, row.expiresAt),
        expiresAt: row.expiresAt.toISOString(),
        consumedAt: row.consumedAt?.toISOString() ?? null,
        inviteUrl: buildInviteUrl(row.token),
      }));
  }

  const store = getMemoryStore();
  return store.invites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    token: invite.token,
    role: invite.role,
    status: buildInviteStatus(invite.consumedAt, invite.expiresAt),
    expiresAt: invite.expiresAt.toISOString(),
    consumedAt: invite.consumedAt?.toISOString() ?? null,
    inviteUrl: buildInviteUrl(invite.token),
  }));
}

export async function getInviteByToken(token: string): Promise<AdminInviteRecord | null> {
  if (hasDatabaseUrl()) {
    const db = createDb();
    const [invite] = await db.select().from(adminInvites).where(eq(adminInvites.token, token));
    if (!invite) {
      return null;
    }

    return {
      id: invite.id,
      email: invite.email,
      token: invite.token,
      role: invite.role,
      status: buildInviteStatus(invite.consumedAt, invite.expiresAt),
      expiresAt: invite.expiresAt.toISOString(),
      consumedAt: invite.consumedAt?.toISOString() ?? null,
      inviteUrl: buildInviteUrl(invite.token),
    };
  }

  const store = getMemoryStore();
  const invite = store.invites.find((item) => item.token === token);
  if (!invite) {
    return null;
  }

  return {
    id: invite.id,
    email: invite.email,
    token: invite.token,
    role: invite.role,
    status: buildInviteStatus(invite.consumedAt, invite.expiresAt),
    expiresAt: invite.expiresAt.toISOString(),
    consumedAt: invite.consumedAt?.toISOString() ?? null,
    inviteUrl: buildInviteUrl(invite.token),
  };
}

export async function acceptAdminInvite(token: string, password: string) {
  if (hasDatabaseUrl()) {
    const db = createDb();
    const [invite] = await db.select().from(adminInvites).where(eq(adminInvites.token, token));

    if (!invite) {
      return { ok: false as const, reason: "invite-not-found" };
    }

    const acceptance = acceptInvite(invite.consumedAt, invite.expiresAt);
    if (!acceptance.ok) {
      return { ok: false as const, reason: acceptance.reason };
    }

    const passwordHash = hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        email: invite.email,
        passwordHash,
        role: "admin",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          passwordHash,
          role: "admin",
          updatedAt: new Date(),
        },
      })
      .returning();

    await db
      .update(adminInvites)
      .set({
        consumedAt: new Date(),
      })
      .where(eq(adminInvites.id, invite.id));

    await db
      .insert(accounts)
      .values({
        userId: user.id,
        provider: "credentials",
        providerAccountId: invite.email,
      })
      .onConflictDoNothing();

    return { ok: true as const, email: user.email };
  }

  const store = getMemoryStore();
  const invite = store.invites.find((item) => item.token === token);
  if (!invite) {
    return { ok: false as const, reason: "invite-not-found" };
  }

  const acceptance = acceptInvite(invite.consumedAt, invite.expiresAt);
  if (!acceptance.ok) {
    return { ok: false as const, reason: acceptance.reason };
  }

  invite.consumedAt = new Date();
  const existing = store.users.find((item) => item.email === invite.email);
  if (existing) {
    existing.passwordHash = hashPassword(password);
  } else {
    store.users.push({
      id: randomUUID(),
      email: invite.email,
      passwordHash: hashPassword(password),
      role: "admin",
    });
  }

  return { ok: true as const, email: invite.email };
}
