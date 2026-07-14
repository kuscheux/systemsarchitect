import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const fallbackTelemetryAdmin = "kmkusche@gmail.com";

export function configuredAdminEmails(envValue = process.env.ADMIN_EMAILS) {
  return envValue
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean) ?? [];
}

export function configuredTelemetryAdminEmails() {
  const emails = configuredAdminEmails(process.env.TELEMETRY_ADMIN_EMAILS);
  return emails.length > 0 ? emails : [fallbackTelemetryAdmin];
}

export function isAllowedEmail(email: string, allowedEmails: string[]) {
  const normalized = email.trim().toLowerCase();
  return allowedEmails.length === 0 || allowedEmails.includes(normalized);
}

export async function requireTelemetryAdmin() {
  if (!hasSupabaseConfig()) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : "";

  if (!email) redirect("/login?next=/admin/sessions");

  return {
    email,
    isAllowed: isAllowedEmail(email, configuredTelemetryAdminEmails()),
  };
}
