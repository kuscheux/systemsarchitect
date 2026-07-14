import { createServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/service";
import type { JobPosting, JobPostingMetric } from "./types";

const jobColumns =
  "id,slug,title,department,employment_type,location,workplace_type,summary,description,responsibilities,qualifications,compensation,application_email,application_url,status,published_at,closes_at,created_by,created_at,updated_at";

function normalizeJob(row: Record<string, unknown>): JobPosting {
  return {
    ...(row as unknown as JobPosting),
    responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities.map(String) : [],
    qualifications: Array.isArray(row.qualifications) ? row.qualifications.map(String) : [],
  };
}

export async function listPublishedJobs(): Promise<JobPosting[]> {
  if (!hasSupabaseServiceConfig()) return [];

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select(jobColumns)
    .eq("status", "published")
    .or(`closes_at.is.null,closes_at.gte.${new Date().toISOString()}`)
    .order("published_at", { ascending: false })
    .abortSignal(AbortSignal.timeout(1500));

  if (error || !data) return [];
  return data.map((row) => normalizeJob(row as Record<string, unknown>));
}

export async function getPublishedJob(slug: string): Promise<JobPosting | null> {
  if (!hasSupabaseServiceConfig()) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select(jobColumns)
    .eq("slug", slug)
    .eq("status", "published")
    .abortSignal(AbortSignal.timeout(1500))
    .maybeSingle();

  if (error || !data) return null;
  return normalizeJob(data as Record<string, unknown>);
}

export async function listJobMetrics(): Promise<{
  jobs: JobPostingMetric[];
  setupError: string | null;
}> {
  if (!hasSupabaseServiceConfig()) {
    return { jobs: [], setupError: "Supabase service configuration is missing." };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("get_job_posting_metrics");

  if (error || !data) {
    return {
      jobs: [],
      setupError: "The jobs migration has not been applied to this Supabase project yet.",
    };
  }

  return {
    jobs: (data as Record<string, unknown>[]).map((row) => ({
      ...normalizeJob(row),
      views: Number(row.views ?? 0),
      unique_visitors: Number(row.unique_visitors ?? 0),
    })),
    setupError: null,
  };
}

export async function getPortalJob(id: string): Promise<JobPosting | null> {
  if (!hasSupabaseServiceConfig()) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select(jobColumns)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return normalizeJob(data as Record<string, unknown>);
}
