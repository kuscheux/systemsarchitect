"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { erpAdapter } from "@/lib/integrations/erp";
import { createClient } from "@/lib/supabase/server";
import type { PortalProfile } from "./types";
import {
  approvalRoles,
  assertRole,
  fabCreatorRoles,
  hasRole,
  projectCreatorRoles,
  projectEditorRoles,
  requirePortalUser,
} from "./auth";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string, label: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function lines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

async function assertProjectWriteAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: PortalProfile,
  projectId: string,
) {
  if (profile.role === "admin" || profile.role === "marketing") return;
  const { data, error } = await supabase
    .from("projects")
    .select("claimed_by,created_by")
    .eq("id", projectId)
    .maybeSingle();
  if (error || !data || (data.claimed_by !== profile.id && data.created_by !== profile.id)) {
    throw new Error("You can only change projects you own.");
  }
}

export async function createProjectAction(formData: FormData) {
  const { supabase, profile } = await requirePortalUser("/portal/projects/new");
  assertRole(profile, projectCreatorRoles);
  const name = required(formData, "name", "Project name");
  const slug = slugify(text(formData, "slug") || name);
  if (!slug) throw new Error("A valid project slug is required.");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      slug,
      company_id: text(formData, "company_id") || null,
      client_name: text(formData, "client_name"),
      location: text(formData, "location"),
      market: text(formData, "market"),
      project_type: text(formData, "project_type"),
      status: text(formData, "status") || "active",
      internal_description: text(formData, "internal_description"),
      public_description: text(formData, "public_description"),
      created_by: profile.id,
      claimed_by: profile.role === "project_manager" ? profile.id : null,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Project could not be created: ${error.message}`);
  revalidatePath("/portal");
  revalidatePath("/portal/projects");
  redirect(`/portal/projects/${data.id}`);
}

export async function updateProjectAction(projectId: string, formData: FormData) {
  const { supabase, profile } = await requirePortalUser(`/portal/projects/${projectId}`);
  assertRole(profile, projectEditorRoles);
  await assertProjectWriteAccess(supabase, profile, projectId);
  const updates = profile.role === "marketing"
    ? { public_description: text(formData, "public_description") }
    : {
        name: required(formData, "name", "Project name"),
        company_id: text(formData, "company_id") || null,
        client_name: text(formData, "client_name"),
        location: text(formData, "location"),
        market: text(formData, "market"),
        project_type: text(formData, "project_type"),
        status: text(formData, "status") || "active",
        internal_description: text(formData, "internal_description"),
        public_description: text(formData, "public_description"),
      };
  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId);
  if (error) throw new Error(`Project could not be updated: ${error.message}`);
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/portal/projects");
}

export async function claimProjectAction(projectId: string) {
  const { supabase, profile } = await requirePortalUser(`/portal/projects/${projectId}`);
  assertRole(profile, ["admin", "project_manager"]);
  const { error } = await supabase
    .from("projects")
    .update({ claimed_by: profile.id })
    .eq("id", projectId)
    .is("claimed_by", null);
  if (error) throw new Error(`Project could not be claimed: ${error.message}`);
  revalidatePath(`/portal/projects/${projectId}`);
}

export async function submitProjectApprovalAction(projectId: string) {
  const { supabase, profile } = await requirePortalUser(`/portal/projects/${projectId}`);
  assertRole(profile, projectEditorRoles);
  await assertProjectWriteAccess(supabase, profile, projectId);
  const { data: existing } = await supabase
    .from("approval_queue")
    .select("id")
    .eq("entity_type", "project")
    .eq("entity_id", projectId)
    .eq("status", "pending")
    .maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("approval_queue").insert({
      entity_type: "project",
      entity_id: projectId,
      submitted_by: profile.id,
    });
    if (error) throw new Error(`Approval could not be submitted: ${error.message}`);
  }
  const { error: projectError } = await supabase
    .from("projects")
    .update({ public_visibility_status: "pending" })
    .eq("id", projectId);
  if (projectError) throw new Error(`Project status could not be updated: ${projectError.message}`);
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/portal/approvals");
  revalidatePath("/portal/publication-queue");
}

export async function uploadProjectAssetAction(projectId: string, formData: FormData) {
  const { supabase, profile } = await requirePortalUser(`/portal/projects/${projectId}`);
  assertRole(profile, ["admin", "project_manager", "marketing"]);
  await assertProjectWriteAccess(supabase, profile, projectId);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a file to upload.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Files must be 20 MB or smaller.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${projectId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("project-assets").upload(storagePath, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (uploadError) throw new Error(`File could not be uploaded: ${uploadError.message}`);
  const { error } = await supabase.from("project_assets").insert({
    project_id: projectId,
    uploaded_by: profile.id,
    asset_type: text(formData, "asset_type") || "image",
    storage_path: storagePath,
    title: text(formData, "title") || file.name,
    description: text(formData, "description"),
    is_public_candidate: formData.get("is_public_candidate") === "on",
  });
  if (error) {
    await supabase.storage.from("project-assets").remove([storagePath]);
    throw new Error(`Asset record could not be created: ${error.message}`);
  }
  revalidatePath(`/portal/projects/${projectId}`);
}

export async function submitAssetApprovalAction(assetId: string, projectId: string) {
  const { supabase, profile } = await requirePortalUser(`/portal/projects/${projectId}`);
  assertRole(profile, ["admin", "project_manager", "marketing"]);
  const { data: asset, error: assetError } = await supabase
    .from("project_assets")
    .select("project_id")
    .eq("id", assetId)
    .maybeSingle();
  if (assetError || !asset || asset.project_id !== projectId) throw new Error("Asset could not be found.");
  await assertProjectWriteAccess(supabase, profile, projectId);
  const { error } = await supabase.from("approval_queue").insert({
    entity_type: "asset",
    entity_id: assetId,
    submitted_by: profile.id,
  });
  if (error && !error.message.toLowerCase().includes("duplicate")) {
    throw new Error(`Asset approval could not be submitted: ${error.message}`);
  }
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/portal/approvals");
}

export async function createFabRequestAction(formData: FormData) {
  const { supabase, profile } = await requirePortalUser("/portal/fab-requests/new");
  assertRole(profile, fabCreatorRoles);
  const projectId = required(formData, "project_id", "Project");
  const { data, error } = await supabase
    .from("fab_requests")
    .insert({
      project_id: projectId,
      requested_by: profile.id,
      assigned_to: text(formData, "assigned_to") || null,
      request_type: required(formData, "request_type", "Request type"),
      priority: text(formData, "priority") || "normal",
      needed_by: text(formData, "needed_by") || null,
      status: "submitted",
      title: required(formData, "title", "Title"),
      description: text(formData, "description"),
      drawing_links: lines(text(formData, "drawing_links")),
      internal_notes: text(formData, "internal_notes"),
    })
    .select("id")
    .single();
  if (error) throw new Error(`Fabrication request could not be created: ${error.message}`);
  await supabase.from("request_activity_log").insert({
    request_id: data.id,
    actor_id: profile.id,
    action: "Request submitted",
    metadata: { status: "submitted" },
  });
  await erpAdapter.createExternalFabRequest({ requestId: data.id, projectId });
  revalidatePath("/portal");
  revalidatePath("/portal/fab-requests");
  redirect(`/portal/fab-requests/${data.id}`);
}

export async function updateFabRequestAction(requestId: string, formData: FormData) {
  const { supabase, profile } = await requirePortalUser(`/portal/fab-requests/${requestId}`);
  if (!hasRole(profile, ["admin", "executive", "estimating", "project_manager", "operations"])) {
    throw new Error("You do not have permission to update fabrication requests.");
  }
  const status = required(formData, "status", "Status");
  const { error } = await supabase
    .from("fab_requests")
    .update({
      status,
      priority: text(formData, "priority") || "normal",
      needed_by: text(formData, "needed_by") || null,
      assigned_to: text(formData, "assigned_to") || null,
      internal_notes: text(formData, "internal_notes"),
    })
    .eq("id", requestId);
  if (error) throw new Error(`Fabrication request could not be updated: ${error.message}`);
  await supabase.from("request_activity_log").insert({
    request_id: requestId,
    actor_id: profile.id,
    action: `Status changed to ${status.replaceAll("_", " ")}`,
    metadata: { status },
  });
  revalidatePath(`/portal/fab-requests/${requestId}`);
  revalidatePath("/portal/fab-requests");
}

export async function addRequestCommentAction(requestId: string, formData: FormData) {
  const { supabase, profile } = await requirePortalUser(`/portal/fab-requests/${requestId}`);
  const body = required(formData, "body", "Comment");
  const { error } = await supabase.from("request_comments").insert({
    request_id: requestId,
    author_id: profile.id,
    body,
  });
  if (error) throw new Error(`Comment could not be added: ${error.message}`);
  await supabase.from("request_activity_log").insert({
    request_id: requestId,
    actor_id: profile.id,
    action: "Comment added",
  });
  revalidatePath(`/portal/fab-requests/${requestId}`);
}

export async function reviewApprovalAction(approvalId: string, formData: FormData) {
  const { supabase, profile } = await requirePortalUser("/portal/approvals");
  assertRole(profile, approvalRoles);
  const decision = text(formData, "decision");
  if (decision !== "approved" && decision !== "rejected") throw new Error("Choose approve or reject.");
  const { data: approval, error: loadError } = await supabase
    .from("approval_queue")
    .select("entity_type,entity_id")
    .eq("id", approvalId)
    .single();
  if (loadError) throw new Error(`Approval could not be loaded: ${loadError.message}`);
  const { error } = await supabase
    .from("approval_queue")
    .update({
      status: decision,
      notes: text(formData, "notes"),
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", approvalId);
  if (error) throw new Error(`Approval could not be reviewed: ${error.message}`);
  if (approval.entity_type === "asset") {
    await supabase.from("project_assets").update({ approved_for_public: decision === "approved" }).eq("id", approval.entity_id);
  }
  if (approval.entity_type === "project" && decision === "rejected") {
    await supabase.from("projects").update({ public_visibility_status: "draft" }).eq("id", approval.entity_id);
  }
  revalidatePath("/portal/approvals");
  revalidatePath("/portal/publication-queue");
  revalidatePath(`/portal/projects/${approval.entity_id}`);
}

export async function publishProjectAction(projectId: string) {
  const { supabase, profile } = await requirePortalUser("/portal/publication-queue");
  assertRole(profile, approvalRoles);
  const { data: approval } = await supabase
    .from("approval_queue")
    .select("id")
    .eq("entity_type", "project")
    .eq("entity_id", projectId)
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();
  if (!approval) throw new Error("This project needs an approved review before publication.");
  const { error } = await supabase
    .from("projects")
    .update({ public_visibility_status: "published", approved_by: profile.id })
    .eq("id", projectId);
  if (error) throw new Error(`Project could not be published: ${error.message}`);
  revalidatePath("/portal/publication-queue");
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/projects");
}
