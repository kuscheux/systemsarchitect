import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Eye, Plus, Users } from "lucide-react";
import { EmptyState, PortalPageHeader, StatusBadge, formatPortalDate, primaryButtonClass } from "@/components/portal/portal-ui";
import { listJobMetrics } from "@/lib/jobs/data";
import { assertRole, requirePortalUser } from "@/lib/portal/auth";

export default async function PortalJobsPage() {
  const { profile } = await requirePortalUser("/portal/jobs");
  assertRole(profile, ["admin", "executive", "marketing"]);
  const { jobs, setupError } = await listJobMetrics();
  const canEdit = profile.role === "admin" || profile.role === "marketing";
  const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);
  const openRoles = jobs.filter((job) => job.status === "published").length;

  return (
    <div className="grid gap-8">
      <PortalPageHeader
        eyebrow="Careers CMS"
        title="Job postings"
        description="Create and publish open roles, preserve closed postings, and review privacy-conscious daily view counts."
        action={canEdit ? <Link href="/portal/jobs/new" className={primaryButtonClass}><Plus size={15} /> New posting</Link> : undefined}
      />

      {setupError ? (
        <div className="border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <strong>Database setup required.</strong> {setupError}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border border-zinc-200 bg-white p-5"><BriefcaseBusiness size={17} className="text-zinc-400" /><p className="mt-5 text-3xl font-semibold tracking-[-0.05em]">{jobs.length}</p><p className="mt-1 text-xs text-zinc-500">All postings</p></div>
          <div className="border border-zinc-200 bg-white p-5"><Eye size={17} className="text-zinc-400" /><p className="mt-5 text-3xl font-semibold tracking-[-0.05em]">{totalViews}</p><p className="mt-1 text-xs text-zinc-500">Daily deduplicated views</p></div>
          <div className="border border-zinc-200 bg-white p-5"><Users size={17} className="text-zinc-400" /><p className="mt-5 text-3xl font-semibold tracking-[-0.05em]">{openRoles}</p><p className="mt-1 text-xs text-zinc-500">Published roles</p></div>
        </div>
      )}

      {!setupError && jobs.length === 0 ? (
        <EmptyState title="No job postings yet" body="Create a draft, review the copy, then publish it when the role is approved." action={canEdit ? <Link href="/portal/jobs/new" className={primaryButtonClass}>Create posting</Link> : undefined} />
      ) : null}

      {jobs.length > 0 ? (
        <div className="overflow-x-auto border border-zinc-200 bg-white">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-zinc-200 bg-zinc-50 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">
              <tr><th className="px-5 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Views</th><th className="px-4 py-3 font-medium">Visitors</th><th className="px-4 py-3 font-medium">Updated</th><th className="px-5 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-4"><p className="text-sm font-medium">{job.title}</p><p className="mt-1 text-xs text-zinc-500">{job.department} · {job.location}</p></td>
                  <td className="px-4 py-4"><StatusBadge value={job.status} /></td>
                  <td className="px-4 py-4 font-mono text-sm">{job.views}</td>
                  <td className="px-4 py-4 font-mono text-sm">{job.unique_visitors}</td>
                  <td className="px-4 py-4 font-mono text-[11px] text-zinc-500">{formatPortalDate(job.updated_at)}</td>
                  <td className="px-5 py-4 text-right"><Link href={`/portal/jobs/${job.id}`} className="inline-flex items-center gap-2 text-xs font-medium">Open <ArrowRight size={14} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

