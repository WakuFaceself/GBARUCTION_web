import { env } from "@/lib/env";

export function createInviteEmail(email: string, inviteUrl: string) {
  return {
    apiKeyPresent: Boolean(env.RESEND_API_KEY),
    to: email,
    subject: "GBARUCTION admin invite",
    html: `<p>You have been invited to GBARUCTION admin.</p><p><a href="${inviteUrl}">Accept invite</a></p>`,
  };
}
