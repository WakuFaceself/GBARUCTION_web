import { Resend } from "resend";

import { env } from "@/lib/env";

export function createInviteEmail(email: string, inviteUrl: string) {
  return {
    apiKeyPresent: Boolean(env.RESEND_API_KEY),
    to: email,
    subject: "GBARUCTION admin invite",
    html: `<p>You have been invited to GBARUCTION admin.</p><p><a href="${inviteUrl}">Accept invite</a></p>`,
  };
}

export function createPasswordResetEmail(email: string, resetUrl: string) {
  return {
    apiKeyPresent: Boolean(env.RESEND_API_KEY),
    to: email,
    subject: "GBARUCTION password reset",
    html: `<p>A password reset was requested for your GBARUCTION admin account.</p><p><a href="${resetUrl}">Reset password</a></p>`,
  };
}

export async function sendInviteEmail(email: string, inviteUrl: string) {
  const payload = createInviteEmail(email, inviteUrl);

  if (!env.RESEND_API_KEY) {
    return {
      ok: false as const,
      reason: "missing-api-key",
      preview: payload,
    };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const response = await resend.emails.send({
    from: "GBARUCTION <onboarding@resend.dev>",
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  return {
    ok: true as const,
    deliveryId: response.data?.id ?? null,
    preview: payload,
  };
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const payload = createPasswordResetEmail(email, resetUrl);

  if (!env.RESEND_API_KEY) {
    return {
      ok: false as const,
      reason: "missing-api-key",
      preview: payload,
    };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const response = await resend.emails.send({
    from: "GBARUCTION <onboarding@resend.dev>",
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  return {
    ok: true as const,
    deliveryId: response.data?.id ?? null,
    preview: payload,
  };
}
