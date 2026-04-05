"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createAdminInvite, createAdminSession, destroyAdminSession, type AdminInviteRecord, ADMIN_SESSION_COOKIE, getAdminSession } from "@/lib/auth";
import { createInviteEmail } from "@/lib/email/resend";

export type InviteComposerState = {
  success: boolean;
  invite: AdminInviteRecord | null;
  emailPreview: ReturnType<typeof createInviteEmail> | null;
  error: string | null;
};

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const session = await createAdminSession(email, password);
  if (!session) {
    redirect("/admin/login?error=invalid-credentials");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: session.expiresAt,
  });

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
      error: "Email is required.",
    };
  }

  const invite = await createAdminInvite(email, role);
  const emailPreview = createInviteEmail(invite.email, invite.inviteUrl);

  return {
    success: true,
    invite,
    emailPreview,
    error: null,
  };
}
