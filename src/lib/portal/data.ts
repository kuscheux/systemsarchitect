import { createClient } from "@/lib/supabase/server";
import type {
  ApprovalItem,
  FabRequest,
  PortalProfile,
  PortalCompany,
  PortalCompanyContact,
  PortalCompanySummary,
  PortalProject,
  ProjectAsset,
  PublishedProject,
  PublishedProjectAsset,
} from "./types";
import { createServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/service";

function throwQueryError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export async function listProjects(filters?: { query?: string; status?: string }) {
  const supabase = await createClient();
  let query = supabase.from("projects").select("*").order("updated_at", { ascending: false });
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters?.query) {
    const term = filters.query.replace(/[,%()]/g, " ").trim();
    if (term) query = query.or(`name.ilike.%${term}%,client_name.ilike.%${term}%,location.ilike.%${term}%`);
  }
  const { data, error } = await query;
  throwQueryError(error, "Projects could not be loaded");
  return (data ?? []) as PortalProject[];
}

export async function getProject(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  throwQueryError(error, "Project could not be loaded");
  return data as PortalProject | null;
}

export async function getProjectWorkspace(id: string) {
  const supabase = await createClient();
  const [project, requests, assets, approvals, profiles] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("fab_requests").select("*,projects(id,name,slug)").eq("project_id", id).order("updated_at", { ascending: false }),
    supabase.from("project_assets").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("approval_queue").select("*").eq("entity_id", id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,user_id,full_name,email,role,department").order("full_name"),
  ]);
  throwQueryError(project.error, "Project could not be loaded");
  throwQueryError(requests.error, "Project requests could not be loaded");
  throwQueryError(assets.error, "Project assets could not be loaded");
  throwQueryError(approvals.error, "Project approvals could not be loaded");
  throwQueryError(profiles.error, "Profiles could not be loaded");
  const companyId = (project.data as PortalProject | null)?.company_id;
  const company = companyId
    ? await supabase.from("companies").select("*").eq("id", companyId).maybeSingle()
    : { data: null, error: null };
  throwQueryError(company.error, "Project company could not be loaded");
  const companies = await supabase.from("companies").select("*").order("name");
  throwQueryError(companies.error, "Companies could not be loaded");
  return {
    project: project.data as PortalProject | null,
    requests: (requests.data ?? []) as FabRequest[],
    assets: (assets.data ?? []) as ProjectAsset[],
    approvals: (approvals.data ?? []) as ApprovalItem[],
    profiles: (profiles.data ?? []) as PortalProfile[],
    company: company.data as PortalCompany | null,
    companies: (companies.data ?? []) as PortalCompany[],
  };
}

export async function listCompanies() {
  const supabase = await createClient();
  const [companies, projects] = await Promise.all([
    supabase.from("companies").select("*").order("name"),
    supabase.from("projects").select("company_id"),
  ]);
  throwQueryError(companies.error, "Companies could not be loaded");
  throwQueryError(projects.error, "Company projects could not be loaded");
  const counts = new Map<string, number>();
  for (const project of projects.data ?? []) {
    if (!project.company_id) continue;
    counts.set(project.company_id, (counts.get(project.company_id) ?? 0) + 1);
  }
  return (companies.data ?? []).map((company) => ({
    ...(company as PortalCompany),
    project_count: counts.get(company.id) ?? 0,
  })) as PortalCompanySummary[];
}

export async function getCompanyWorkspace(id: string) {
  const supabase = await createClient();
  const [company, contacts, projects] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase.from("company_contacts").select("*").eq("company_id", id).order("is_primary", { ascending: false }),
    supabase.from("projects").select("*").eq("company_id", id).order("updated_at", { ascending: false }),
  ]);
  throwQueryError(company.error, "Company could not be loaded");
  throwQueryError(contacts.error, "Company contacts could not be loaded");
  throwQueryError(projects.error, "Company projects could not be loaded");

  const companyProjects = (projects.data ?? []) as PortalProject[];
  const projectIds = companyProjects.map((project) => project.id);
  const assets = projectIds.length
    ? await supabase.from("project_assets").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
    : { data: [], error: null };
  throwQueryError(assets.error, "Company project assets could not be loaded");
  const companyAssets = (assets.data ?? []) as ProjectAsset[];
  const assetIds = companyAssets.map((asset) => asset.id);
  const [projectApprovals, assetApprovals] = await Promise.all([
    projectIds.length
      ? supabase.from("approval_queue").select("*").in("entity_id", projectIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    assetIds.length
      ? supabase.from("approval_queue").select("*").in("entity_id", assetIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);
  throwQueryError(projectApprovals.error, "Company project approvals could not be loaded");
  throwQueryError(assetApprovals.error, "Company asset approvals could not be loaded");

  return {
    company: company.data as PortalCompany | null,
    contacts: (contacts.data ?? []) as PortalCompanyContact[],
    projects: companyProjects,
    assets: companyAssets,
    approvals: [
      ...((projectApprovals.data ?? []) as ApprovalItem[]),
      ...((assetApprovals.data ?? []) as ApprovalItem[]),
    ].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  };
}

export async function listFabRequests(filters?: { status?: string; priority?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("fab_requests")
    .select("*,projects(id,name,slug)")
    .order("needed_by", { ascending: true, nullsFirst: false });
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters?.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);
  const { data, error } = await query;
  throwQueryError(error, "Fabrication requests could not be loaded");
  return (data ?? []) as FabRequest[];
}

export async function listProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,user_id,full_name,email,role,department")
    .order("full_name");
  throwQueryError(error, "Profiles could not be loaded");
  return (data ?? []) as PortalProfile[];
}

export async function getFabRequestWorkspace(id: string) {
  const supabase = await createClient();
  const [request, comments, activity, profiles] = await Promise.all([
    supabase.from("fab_requests").select("*,projects(id,name,slug)").eq("id", id).maybeSingle(),
    supabase.from("request_comments").select("*,profiles(full_name,email)").eq("request_id", id).order("created_at"),
    supabase.from("request_activity_log").select("*,profiles(full_name,email)").eq("request_id", id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,user_id,full_name,email,role,department").order("full_name"),
  ]);
  throwQueryError(request.error, "Fabrication request could not be loaded");
  throwQueryError(comments.error, "Comments could not be loaded");
  throwQueryError(activity.error, "Activity could not be loaded");
  throwQueryError(profiles.error, "Profiles could not be loaded");
  return {
    request: request.data as FabRequest | null,
    comments: comments.data ?? [],
    activity: activity.data ?? [],
    profiles: (profiles.data ?? []) as PortalProfile[],
  };
}

export async function listApprovals(status = "pending") {
  const supabase = await createClient();
  let query = supabase.from("approval_queue").select("*").order("created_at");
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  throwQueryError(error, "Approvals could not be loaded");
  return (data ?? []) as ApprovalItem[];
}

export async function getApprovalEntities(items: ApprovalItem[]) {
  const supabase = await createClient();
  const projectIds = items.filter((item) => item.entity_type === "project").map((item) => item.entity_id);
  const assetIds = items.filter((item) => item.entity_type === "asset").map((item) => item.entity_id);
  const [projects, assets] = await Promise.all([
    projectIds.length ? supabase.from("projects").select("*").in("id", projectIds) : Promise.resolve({ data: [], error: null }),
    assetIds.length ? supabase.from("project_assets").select("*").in("id", assetIds) : Promise.resolve({ data: [], error: null }),
  ]);
  throwQueryError(projects.error, "Approval projects could not be loaded");
  throwQueryError(assets.error, "Approval assets could not be loaded");
  return {
    projects: (projects.data ?? []) as PortalProject[],
    assets: (assets.data ?? []) as ProjectAsset[],
  };
}

export async function getPublishedProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_published_projects");
  throwQueryError(error, "Published projects could not be loaded");
  return (data ?? []) as PublishedProject[];
}

export async function getPublishedProjectBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_published_project", { project_slug: slug });
  throwQueryError(error, "Published project could not be loaded");
  return ((data ?? [])[0] as PublishedProject | undefined) ?? null;
}

export async function getPublishedProjectAssets(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_published_project_assets", {
    target_project_id: projectId,
  });
  throwQueryError(error, "Published project assets could not be loaded");
  if (!hasSupabaseServiceConfig()) return [] as PublishedProjectAsset[];
  const service = createServiceClient();
  const signed = await Promise.all(
    (data ?? []).map(async (asset: ProjectAsset) => {
      const { data: urlData } = await service.storage
        .from("project-assets")
        .createSignedUrl(asset.storage_path, 60 * 60);
      return urlData?.signedUrl ? { ...asset, url: urlData.signedUrl } : null;
    }),
  );
  return signed.filter((asset): asset is PublishedProjectAsset => Boolean(asset));
}
