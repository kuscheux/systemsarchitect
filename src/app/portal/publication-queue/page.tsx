import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { EmptyState, PortalPageHeader, StatusBadge, formatPortalDate, primaryButtonClass, secondaryButtonClass } from "@/components/portal/portal-ui";
import { publishProjectAction } from "@/lib/portal/actions";
import { approvalRoles, hasRole, requirePortalUser } from "@/lib/portal/auth";
import { listApprovals, listProjects } from "@/lib/portal/data";

export default async function PublicationQueuePage() {
  const [{ profile }, projects, approved] = await Promise.all([
    requirePortalUser("/portal/publication-queue"),
    listProjects(),
    listApprovals("approved"),
  ]);
  const canPublish = hasRole(profile, approvalRoles);
  const queue = projects.filter((project) => ["pending", "published"].includes(project.public_visibility_status));
  const isApproved = (projectId: string) => approved.some((item) => item.entity_type === "project" && item.entity_id === projectId);
  return (
    <div className="grid gap-8">
      <PortalPageHeader eyebrow="Marketing / Public website" title="Publication queue" description="Approved project stories move from internal draft to the public website through an explicit release step." />
      {queue.length === 0 ? <EmptyState title="Nothing waiting to publish" body="Submit public project content from a project record to start the review workflow." /> : (
        <div className="overflow-x-auto border border-zinc-200 bg-white"><table className="w-full min-w-[920px] text-left"><thead className="border-b border-zinc-200 bg-zinc-50 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500"><tr><th className="px-5 py-3 font-medium">Project</th><th className="px-4 py-3 font-medium">Approval</th><th className="px-4 py-3 font-medium">Visibility</th><th className="px-4 py-3 font-medium">Updated</th><th /></tr></thead><tbody className="divide-y divide-zinc-100">{queue.map((project) => { const publishAction = publishProjectAction.bind(null, project.id); const approvedForRelease = isApproved(project.id); return <tr key={project.id} className="hover:bg-zinc-50"><td className="px-5 py-4"><p className="text-sm font-medium">{project.name}</p><p className="mt-1 max-w-xl truncate text-xs text-zinc-500">{project.public_description || "Public copy not supplied"}</p></td><td className="px-4 py-4"><StatusBadge value={approvedForRelease ? "approved" : "pending"} /></td><td className="px-4 py-4"><StatusBadge value={project.public_visibility_status} /></td><td className="px-4 py-4 font-mono text-[11px] text-zinc-500">{formatPortalDate(project.updated_at)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link href={`/portal/projects/${project.id}`} className={secondaryButtonClass}>Review <ArrowRight size={13} /></Link>{canPublish && approvedForRelease && project.public_visibility_status !== "published" ? <form action={publishAction}><button className={primaryButtonClass}><CheckCircle2 size={14} /> Publish</button></form> : null}</div></td></tr>; })}</tbody></table></div>
      )}
      <div className="border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-500"><strong className="text-zinc-950">Public data boundary:</strong> published pages use dedicated Supabase RPCs that return only approved public fields. Internal descriptions, drawing links, comments, notes, and activity are not part of those responses.</div>
    </div>
  );
}

