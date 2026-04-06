"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AuthConfigurationError,
  createAdminInvite,
  createAdminSession,
  createPasswordResetToken,
  destroyAdminSession,
  getAdminSession,
  getAdminSessionCookieOptions,
  resetAdminPassword,
  type AdminInviteRecord,
  ADMIN_SESSION_COOKIE,
} from "@/lib/auth";
import { createInviteEmail, sendInviteEmail, sendPasswordResetEmail } from "@/lib/email/resend";

export type InviteComposerState = {
  success: boolean;
  invite: AdminInviteRecord | null;
  emailPreview: ReturnType<typeof createInviteEmail> | null;
  delivery: { ok: boolean; deliveryId: string | null; reason?: string } | null;
  error: string | null;
};

const inviteLinkError = "Invite links are temporarily unavailable.";

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const session = await createAdminSession(email, password);
  if (!session) {
    redirect("/admin/login?error=invalid-credentials");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, session.token, getAdminSessionCookieOptions(session.expiresAt));

  redirect("/admin");
}

export async function logoutAdminAction() {
  const session = await getAdminSession();
  if (session) {
    await destroyAdminSession(session.token);
  }

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

export async function createAdminInviteAction(
  _state: InviteComposerState,
  formData: FormData,
): Promise<InviteComposerState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "admin").trim() || "admin";

  if (!email) {
    return {
      success: false,
      invite: null,
      emailPreview: null,
      delivery: null,
      error: "Email is required.",
    };
  }

  let invite: Awaited<ReturnType<typeof createAdminInvite>>;
  try {
    invite = await createAdminInvite(email, role);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return {
        success: false,
        invite: null,
        emailPreview: null,
        delivery: null,
        error: inviteLinkError,
      };
    }

    throw error;
  }

  const deliveryResult = await sendInviteEmail(invite.email, invite.inviteUrl);

  return {
    success: true,
    invite,
    emailPreview: deliveryResult.preview,
    delivery: deliveryResult.ok
      ? { ok: true, deliveryId: deliveryResult.deliveryId }
      : { ok: false, deliveryId: null, reason: deliveryResult.reason },
    error: null,
  };
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect("/admin/reset-password?error=missing-email");
  }

  let reset: Awaited<ReturnType<typeof createPasswordResetToken>>;
  try {
    reset = await createPasswordResetToken(email);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      redirect("/admin/reset-password?error=auth-config-missing");
    }

    throw error;
  }

  if (!reset) {
    redirect("/admin/reset-password?sent=1");
  }

  const deliveryResult = await sendPasswordResetEmail(reset.email, reset.resetUrl);
  const status = deliveryResult.ok ? "queued" : deliveryResult.reason ?? "preview";
  redirect(`/admin/reset-password?sent=1&mode=${status}`);
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await resetAdminPassword(token, password);
  if (!result.ok) {
    redirect(`/admin/reset-password/${token}?error=${result.reason}`);
  }

  redirect("/admin/login?reset=1");
}
