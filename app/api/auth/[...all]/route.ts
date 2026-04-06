import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createAdminInvite,
  createAdminSession,
  createPasswordResetToken,
  destroyAdminSession,
  getAdminSession,
  getAdminSessionCookieOptions,
  requireAdminSession,
  resetAdminPassword,
  acceptAdminInvite,
  ADMIN_SESSION_COOKIE,
} from "@/lib/auth";
import { createInviteEmail, sendInviteEmail, sendPasswordResetEmail } from "@/lib/email/resend";

function getAction(request: Request) {
  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  return segments.slice(2).join("/");
}

export async function GET(request: Request) {
  const action = getAction(request);

  if (action === "session") {
    const session = await getAdminSession();
    return NextResponse.json({ ok: true, session });
  }

  return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
}

export async function POST(request: Request) {
  const action = getAction(request);

  if (action === "sign-in") {
    const body = (await request.json()) as { email?: string; password?: string };
    const session = await createAdminSession(body.email ?? "", body.password ?? "");

    if (!session) {
      return NextResponse.json({ ok: false, reason: "invalid-credentials" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, session.token, getAdminSessionCookieOptions(session.expiresAt));

    return NextResponse.json({ ok: true, session });
  }

  if (action === "sign-out") {
    const session = await getAdminSession();
    if (session) {
      await destroyAdminSession(session.token);
    }

    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    return NextResponse.json({ ok: true });
  }

  if (action === "invite") {
    try {
      await requireAdminSession();
    } catch {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { email?: string; role?: string };
    if (!body.email) {
      return NextResponse.json({ ok: false, reason: "missing-email" }, { status: 400 });
    }

    const invite = await createAdminInvite(body.email, body.role ?? "admin");
    const delivery = await sendInviteEmail(invite.email, invite.inviteUrl);

    return NextResponse.json({
      ok: true,
      invite,
      emailPreview: delivery.preview ?? createInviteEmail(invite.email, invite.inviteUrl),
      delivery,
    });
  }

  if (action === "invite/accept") {
    const body = (await request.json()) as { token?: string; password?: string };
    if (!body.token || !body.password) {
      return NextResponse.json({ ok: false, reason: "missing-fields" }, { status: 400 });
    }

    const result = await acceptAdminInvite(body.token, body.password);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  }

  if (action === "forgot-password") {
    const body = (await request.json()) as { email?: string };
    if (!body.email) {
      return NextResponse.json({ ok: false, reason: "missing-email" }, { status: 400 });
    }

    const reset = await createPasswordResetToken(body.email);
    if (!reset) {
      return NextResponse.json({ ok: true });
    }

    await sendPasswordResetEmail(reset.email, reset.resetUrl);
    return NextResponse.json({ ok: true });
  }

  if (action === "reset-password") {
    const body = (await request.json()) as { token?: string; password?: string };
    if (!body.token || !body.password) {
      return NextResponse.json({ ok: false, reason: "missing-fields" }, { status: 400 });
    }

    const result = await resetAdminPassword(body.token, body.password);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
}
