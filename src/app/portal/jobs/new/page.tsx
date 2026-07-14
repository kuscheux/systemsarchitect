import { JobPostingForm } from "@/components/portal/job-posting-form";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { createJobPostingAction } from "@/lib/jobs/actions";
import { assertRole, requirePortalUser } from "@/lib/portal/auth";

export default async function NewJobPostingPage() {
  const { profile } = await requirePortalUser("/portal/jobs/new");
  assertRole(profile, ["admin", "marketing"]);

  return (
    <div className="grid gap-8">
      <PortalPageHeader eyebrow="Careers / New" title="Create job posting" description="Write the complete role once, review it as a draft, and publish it without a code deployment." />
      <JobPostingForm action={createJobPostingAction} />
    </div>
  );
}

