import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import type { PortalProfile, PortalRole } from "./types";

export const approvalRoles: PortalRole[] = ["admin", "executive", "marketing"];
export const projectEditorRoles: PortalRole[] = [
  "admin",
  "project_manager",
  "marketing",
];
export const projectCreatorRoles: PortalRole[] = ["admin", "project_manager"];
export const fabCreatorRoles: PortalRole[] = [
  "admin",
  "estimating",
  "project_manager",
  "operations",
];
export const employeePortalRoles: PortalRole[] = [
  "admin",
  "executive",
  "estimating",
  "project_manager",
  "operations",
  "marketing",
];

export function hasRole(profile: PortalProfile, allowed: PortalRole[]) {
  return allowed.includes(profile.role);
}

export function assertRole(profile: PortalProfile, allowed: PortalRole[]) {
  if (!hasRole(profile, allowed)) {
    throw new Error("You do not have permission to perform this action.");
  }
}

export async function requirePortalUser(nextPath = "/portal") {
  if (!hasSupabaseConfig()) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : "";

  if (!userId) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  const { data, error } = await supabase
    .from("profiles")
    .select("id,user_id,full_name,email,role,department")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Portal setup is incomplete. Run supabase-portal.sql in Supabase.");
  }
  if (!data) {
    throw new Error("Your authenticated account does not have a portal profile.");
  }

  return { supabase, profile: data as PortalProfile };
}

export async function requireEmployeePortalUser(nextPath = "/portal") {
  const context = await requirePortalUser(nextPath);
  if (!hasRole(context.profile, employeePortalRoles)) redirect("/account");
  return context;
}
