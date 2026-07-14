"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertRole, requirePortalUser } from "@/lib/portal/auth";

const jobEditorRoles = ["admin", "marketing"] as const;

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
    .slice(0, 90);
}

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function nullableDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function jobPayload(formData: FormData) {
  const title = required(formData, "title", "Job title");
  const status = text(formData, "status") || "draft";

  return {
    slug: slugify(text(formData, "slug") || title),
    title,
    department: required(formData, "department", "Department"),
    employment_type: text(formData, "employment_type") || "Full-time",
    location: required(formData, "location", "Location"),
    workplace_type: text(formData, "workplace_type") || "On-site",
    summary: required(formData, "summary", "Summary"),
    description: required(formData, "description", "Description"),
    responsibilities: lines(text(formData, "responsibilities")),
    qualifications: lines(text(formData, "qualifications")),
    compensation: text(formData, "compensation"),
    application_email: text(formData, "application_email"),
    application_url: text(formData, "application_url"),
    status,
    closes_at: nullableDate(text(formData, "closes_at")),
  };
}

export async function createJobPostingAction(formData: FormData) {
  const { supabase, profile } = await requirePortalUser("/portal/jobs/new");
  assertRole(profile, [...jobEditorRoles]);
  const payload = jobPayload(formData);

  const { data, error } = await supabase
    .from("job_postings")
    .insert({
      ...payload,
      created_by: profile.id,
      published_at: payload.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Job posting could not be created: ${error.message}`);
  revalidatePath("/careers");
  revalidatePath("/portal/jobs");
  redirect(`/portal/jobs/${data.id}`);
}

export async function updateJobPostingAction(jobId: string, formData: FormData) {
  const { supabase, profile } = await requirePortalUser(`/portal/jobs/${jobId}`);
  assertRole(profile, [...jobEditorRoles]);
  const payload = jobPayload(formData);

  const { data: current, error: currentError } = await supabase
    .from("job_postings")
    .select("slug,status,published_at")
    .eq("id", jobId)
    .maybeSingle();

  if (currentError || !current) throw new Error("Job posting could not be found.");
  const publishedAt =
    payload.status === "published"
      ? current.published_at || new Date().toISOString()
      : current.published_at;

  const { error } = await supabase
    .from("job_postings")
    .update({ ...payload, published_at: publishedAt })
    .eq("id", jobId);

  if (error) throw new Error(`Job posting could not be updated: ${error.message}`);
  revalidatePath("/careers");
  revalidatePath(`/careers/${current.slug}`);
  revalidatePath(`/careers/${payload.slug}`);
  revalidatePath("/portal/jobs");
  revalidatePath(`/portal/jobs/${jobId}`);
}

