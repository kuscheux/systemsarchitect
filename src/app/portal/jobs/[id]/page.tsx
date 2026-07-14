import { notFound } from "next/navigation";
import { JobPostingForm } from "@/components/portal/job-posting-form";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { updateJobPostingAction } from "@/lib/jobs/actions";
import { getPortalJob } from "@/lib/jobs/data";
import { assertRole, requirePortalUser } from "@/lib/portal/auth";

export default async function EditJobPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requirePortalUser(`/portal/jobs/${id}`);
  assertRole(profile, ["admin", "executive", "marketing"]);
  const job = await getPortalJob(id);
  if (!job) notFound();
  const canEdit = profile.role === "admin" || profile.role === "marketing";

  return (
    <div className="grid gap-8">
      <PortalPageHeader eyebrow={`Careers / ${job.status}`} title={job.title} description={canEdit ? "Update the role details or change its publishing status." : "Review the current posting and publishing status."} />
      {canEdit ? (
        <JobPostingForm action={updateJobPostingAction.bind(null, job.id)} job={job} />
      ) : (
        <div className="border border-zinc-200 bg-white p-7 text-sm leading-7 text-zinc-600">Executive access is read-only. Job copy and publishing controls are available to administrators and marketing.</div>
      )}
    </div>
  );
}

