export const jobStatuses = ["draft", "published", "closed"] as const;
export const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
] as const;

export type JobStatus = (typeof jobStatuses)[number];

export type JobPosting = {
  id: string;
  slug: string;
  title: string;
  department: string;
  employment_type: string;
  location: string;
  workplace_type: string;
  summary: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  compensation: string;
  application_email: string;
  application_url: string;
  status: JobStatus;
  published_at: string | null;
  closes_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type JobPostingMetric = JobPosting & {
  views: number;
  unique_visitors: number;
};

