import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { EmptyState, Field, PortalPageHeader, StatusBadge, formatPortalDate, primaryButtonClass, secondaryButtonClass, textareaClass } from "@/components/portal/portal-ui";
import { reviewApprovalAction } from "@/lib/portal/actions";
import { approvalRoles, assertRole, requirePortalUser } from "@/lib/portal/auth";
import { getApprovalEntities, listApprovals } from "@/lib/portal/data";

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [{ profile }, params] = await Promise.all([requirePortalUser("/portal/approvals"), searchParams]);
  assertRole(profile, approvalRoles);
  const status = params.status || "pending";
  const approvals = await listApprovals(status);
  const entities = await getApprovalEntities(approvals);
  return (
    <div className="grid gap-8">
      <PortalPageHeader eyebrow="Content governance" title="Approvals" description="Review only the content proposed for public use. Operational notes and fabrication records stay outside this workflow." />
      <nav className="flex gap-2">{["pending", "approved", "rejected", "all"].map((item) => <Link key={item} href={`/portal/approvals?status=${item}`} className={item === status ? primaryButtonClass : secondaryButtonClass}>{item}</Link>)}</nav>
      {approvals.length === 0 ? <EmptyState title="Queue is clear" body={`There are no ${status === "all" ? "" : status} approval items.`} /> : (
        <div className="grid gap-4">
          {approvals.map((approval) => {
            const project = entities.projects.find((item) => item.id === approval.entity_id);
            const asset = entities.assets.find((item) => item.id === approval.entity_id);
            const action = reviewApprovalAction.bind(null, approval.id);
            return (
              <article key={approval.id} className="grid border border-zinc-200 bg-white xl:grid-cols-[1fr_420px]">
                <div className="p-5 md:p-7">
                  <div className="flex items-center justify-between gap-4"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{approval.entity_type} review</p><StatusBadge value={approval.status} /></div>
                  <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">{project?.name || asset?.title || "Approval item"}</h2>
                  {project ? <><p className="mt-3 text-sm text-zinc-500">{project.client_name || "Client pending"} · {project.location || "Location pending"}</p><div className="mt-6 border-l-2 border-zinc-950 pl-5"><p className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">Proposed public copy</p><p className="mt-3 text-lg leading-8 text-zinc-700">{project.public_description || "No public description supplied."}</p></div><Link href={`/portal/projects/${project.id}`} className="mt-6 inline-flex items-center gap-2 text-xs font-medium">Open project <ExternalLink size={13} /></Link></> : null}
                  {asset ? <><p className="mt-3 text-sm text-zinc-500">{asset.asset_type} · Submitted {formatPortalDate(approval.created_at)}</p><a href={`/api/portal/assets/${asset.id}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-medium">Inspect asset <ExternalLink size={13} /></a></> : null}
                </div>
                <form action={action} className="grid content-start gap-4 border-t border-zinc-200 bg-zinc-50 p-5 md:p-7 xl:border-l xl:border-t-0">
                  <Field label="Reviewer notes"><textarea name="notes" defaultValue={approval.notes} placeholder="Reasoning and required next step" className={textareaClass} /></Field>
                  {approval.status === "pending" ? <div className="grid grid-cols-2 gap-2"><button name="decision" value="rejected" className={secondaryButtonClass}>Reject</button><button name="decision" value="approved" className={primaryButtonClass}>Approve</button></div> : <p className="text-sm text-zinc-500">Reviewed {formatPortalDate(approval.reviewed_at, true)}</p>}
                </form>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
