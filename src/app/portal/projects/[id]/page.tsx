import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, FileImage, LockKeyhole, Upload } from "lucide-react";
import {
  Field,
  PortalPageHeader,
  StatusBadge,
  formatPortalDate,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textareaClass,
} from "@/components/portal/portal-ui";
import {
  claimProjectAction,
  submitAssetApprovalAction,
  submitProjectApprovalAction,
  updateProjectAction,
  uploadProjectAssetAction,
} from "@/lib/portal/actions";
import { hasRole, requirePortalUser } from "@/lib/portal/auth";
import { getProjectWorkspace } from "@/lib/portal/data";

export default async function PortalProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ profile }, workspace] = await Promise.all([
    requirePortalUser(`/portal/projects/${id}`),
    getProjectWorkspace(id),
  ]);
  if (!workspace.project) notFound();
  const project = workspace.project;
  const ownsProject = project.claimed_by === profile.id || project.created_by === profile.id;
  const canEditInternal = profile.role === "admin" || (profile.role === "project_manager" && ownsProject);
  const canEdit = canEditInternal || profile.role === "marketing";
  const canClaim = hasRole(profile, ["admin", "project_manager"]);
  const canUpload = hasRole(profile, ["admin", "marketing"]) || (profile.role === "project_manager" && ownsProject);
  const owner = workspace.profiles.find((item) => item.id === project.claimed_by);
  const latestApproval = workspace.approvals[0];
  const updateAction = updateProjectAction.bind(null, id);
  const claimAction = claimProjectAction.bind(null, id);
  const submitAction = submitProjectApprovalAction.bind(null, id);
  const uploadAction = uploadProjectAssetAction.bind(null, id);

  return (
    <div className="grid gap-8">
      <Link href="/portal/projects" className="inline-flex w-fit items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-950"><ArrowLeft size={14} /> Projects</Link>
      <PortalPageHeader
        eyebrow={`${project.market || "Market pending"} / ${project.location || "Location pending"}`}
        title={project.name}
        description={`${project.client_name || "Client pending"} · Owned by ${owner?.full_name || owner?.email || "unassigned"}`}
        action={<div className="flex flex-wrap items-center gap-2">{project.presentation_url ? <Link href={project.presentation_url} className={primaryButtonClass}>Open presentation <ExternalLink size={14} /></Link> : null}<StatusBadge value={project.status} /><StatusBadge value={project.public_visibility_status} /></div>}
      />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Project owner", owner?.full_name || owner?.email || "Unassigned"],
          ["Fab requests", String(workspace.requests.length)],
          ["Assets", String(workspace.assets.length)],
          ["Approval", latestApproval?.status || "Not submitted"],
        ].map(([label, value]) => <div key={label} className="border border-zinc-200 bg-white p-5"><p className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">{label}</p><p className="mt-4 text-lg font-semibold tracking-[-0.025em]">{value}</p></div>)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form action={updateAction} className="grid gap-5 border border-zinc-200 bg-white p-5 md:grid-cols-2 md:p-7">
          <div className="md:col-span-2 flex items-center justify-between border-b border-zinc-200 pb-4"><div><h2 className="text-xl font-semibold tracking-[-0.035em]">Project record</h2><p className="mt-1 text-xs text-zinc-500">Internal facts and public copy are stored separately.</p></div><LockKeyhole size={18} className="text-zinc-400" /></div>
          <Field label="Project name"><input name="name" defaultValue={project.name} readOnly={!canEditInternal} className={inputClass} /></Field>
          <Field label="Client"><input name="client_name" defaultValue={project.client_name} readOnly={!canEditInternal} className={inputClass} /></Field>
          <Field label="Location"><input name="location" defaultValue={project.location} readOnly={!canEditInternal} className={inputClass} /></Field>
          <Field label="Market"><input name="market" defaultValue={project.market} readOnly={!canEditInternal} className={inputClass} /></Field>
          <Field label="Project type"><input name="project_type" defaultValue={project.project_type} readOnly={!canEditInternal} className={inputClass} /></Field>
          <Field label="Internal status"><select name="status" defaultValue={project.status} disabled={!canEditInternal} className={inputClass}><option value="active">Active</option><option value="on_hold">On hold</option><option value="complete">Complete</option><option value="archived">Archived</option></select></Field>
          <div className="md:col-span-2"><Field label="Internal description" hint="Protected. Never returned by the public query layer."><textarea name="internal_description" defaultValue={project.internal_description} readOnly={!canEditInternal} className={textareaClass} /></Field></div>
          <div className="md:col-span-2"><Field label="Public description" hint="Eligible for publication only after review."><textarea name="public_description" defaultValue={project.public_description} readOnly={!canEdit} className={textareaClass} /></Field></div>
          {canEdit ? <div className="md:col-span-2"><button className={primaryButtonClass}>Save project record</button></div> : null}
        </form>

        <aside className="grid h-fit gap-4">
          <div className="border border-zinc-200 bg-white p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">Ownership</p>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.035em]">{owner ? "Project is claimed" : "No project owner"}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{owner ? `${owner.full_name || owner.email} is responsible for the internal record.` : "Claiming establishes accountability without changing client-facing content."}</p>
            {canClaim && !project.claimed_by ? <form action={claimAction} className="mt-5"><button className={secondaryButtonClass}>Claim project</button></form> : null}
          </div>
          <div className="border border-zinc-200 bg-white p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500">Publication control</p>
            <div className="mt-4 flex items-center gap-2"><StatusBadge value={project.public_visibility_status} />{latestApproval ? <StatusBadge value={latestApproval.status} /> : null}</div>
            <p className="mt-4 text-sm leading-6 text-zinc-500">Submission sends the public description to reviewers. Internal fields are never included.</p>
            {canEdit && project.public_visibility_status !== "published" ? <form action={submitAction} className="mt-5"><button className={primaryButtonClass}><CheckCircle2 size={15} /> Submit for approval</button></form> : null}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4"><div><h2 className="text-sm font-semibold">Fabrication requests</h2><p className="mt-1 text-xs text-zinc-500">Operational requests linked to this project.</p></div><Link href={`/portal/fab-requests/new?project=${id}`} className={secondaryButtonClass}>New request</Link></div>
          <div className="divide-y divide-zinc-100">
            {workspace.requests.map((request) => <Link key={request.id} href={`/portal/fab-requests/${request.id}`} className="grid gap-3 px-5 py-4 transition hover:bg-zinc-50 md:grid-cols-[1fr_auto_auto] md:items-center"><div><p className="text-sm font-medium">{request.title}</p><p className="mt-1 text-xs text-zinc-500">{request.request_type} · Needed {formatPortalDate(request.needed_by)}</p></div><StatusBadge value={request.priority} /><StatusBadge value={request.status} /></Link>)}
            {workspace.requests.length === 0 ? <p className="p-6 text-sm text-zinc-500">No fabrication requests are linked to this project.</p> : null}
          </div>
        </div>

        <div className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4"><h2 className="text-sm font-semibold">Approval history</h2></div>
          <div className="divide-y divide-zinc-100">
            {workspace.approvals.map((approval) => <div key={approval.id} className="p-5"><div className="flex items-center justify-between gap-4"><span className="text-sm font-medium capitalize">{approval.entity_type} review</span><StatusBadge value={approval.status} /></div><p className="mt-2 text-xs leading-5 text-zinc-500">{approval.notes || "No reviewer notes."}</p><p className="mt-3 font-mono text-[10px] text-zinc-400">{formatPortalDate(approval.reviewed_at || approval.created_at, true)}</p></div>)}
            {workspace.approvals.length === 0 ? <p className="p-6 text-sm text-zinc-500">No approval activity yet.</p> : null}
          </div>
        </div>
      </section>

      <section className="border border-zinc-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold">Project assets</h2><p className="mt-1 text-xs text-zinc-500">Files remain internal unless individually approved.</p></div><FileImage size={18} className="text-zinc-400" /></div>
        {canUpload ? (
          <form action={uploadAction} className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-5 md:grid-cols-[1fr_150px_1fr_auto] md:items-end">
            <Field label="File"><input type="file" name="file" required accept="image/*,video/*,.pdf" className="block h-11 w-full border border-zinc-300 bg-white p-2 text-xs" /></Field>
            <Field label="Type"><select name="asset_type" className={inputClass}><option value="image">Image</option><option value="video">Video</option><option value="document">Document</option><option value="drawing">Drawing</option></select></Field>
            <Field label="Title"><input name="title" className={inputClass} /></Field>
            <div className="grid gap-2"><label className="flex items-center gap-2 text-xs text-zinc-600"><input type="checkbox" name="is_public_candidate" /> Public candidate</label><button className={primaryButtonClass}><Upload size={14} /> Upload</button></div>
          </form>
        ) : null}
        <div className="grid gap-px bg-zinc-200 sm:grid-cols-2 xl:grid-cols-4">
          {workspace.assets.map((asset) => {
            const approvalAction = submitAssetApprovalAction.bind(null, asset.id, id);
            return <article key={asset.id} className="bg-white p-5"><div className="flex items-start justify-between gap-3"><FileImage size={18} className="text-zinc-400" /><StatusBadge value={asset.approved_for_public ? "approved" : asset.is_public_candidate ? "pending" : "internal"} /></div><h3 className="mt-6 truncate text-sm font-semibold">{asset.title || "Untitled asset"}</h3><p className="mt-1 text-xs capitalize text-zinc-500">{asset.asset_type} · {formatPortalDate(asset.created_at)}</p><div className="mt-5 flex flex-wrap gap-2"><a href={`/api/portal/assets/${asset.id}`} target="_blank" rel="noreferrer" className={secondaryButtonClass}>Open <ExternalLink size={13} /></a>{canUpload && asset.is_public_candidate && !asset.approved_for_public ? <form action={approvalAction}><button className={secondaryButtonClass}>Submit</button></form> : null}</div></article>;
          })}
          {workspace.assets.length === 0 ? <p className="col-span-full bg-white p-6 text-sm text-zinc-500">No project assets uploaded.</p> : null}
        </div>
      </section>

      <Link href="/portal/publication-queue" className="inline-flex w-fit items-center gap-2 text-sm font-medium">Review publication workflow <ArrowRight size={15} /></Link>
    </div>
  );
}
