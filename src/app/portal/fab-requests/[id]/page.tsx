import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MessageSquare } from "lucide-react";
import { Field, PortalPageHeader, StatusBadge, formatPortalDate, inputClass, primaryButtonClass, textareaClass } from "@/components/portal/portal-ui";
import { addRequestCommentAction, updateFabRequestAction } from "@/lib/portal/actions";
import { hasRole, requirePortalUser } from "@/lib/portal/auth";
import { getFabRequestWorkspace } from "@/lib/portal/data";

export default async function FabRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ profile }, workspace] = await Promise.all([requirePortalUser(`/portal/fab-requests/${id}`), getFabRequestWorkspace(id)]);
  if (!workspace.request) notFound();
  const request = workspace.request;
  const canUpdate =
    hasRole(profile, ["admin", "executive", "estimating"]) ||
    request.requested_by === profile.id ||
    request.assigned_to === profile.id;
  const updateAction = updateFabRequestAction.bind(null, id);
  const commentAction = addRequestCommentAction.bind(null, id);
  return (
    <div className="grid gap-8">
      <Link href="/portal/fab-requests" className="inline-flex w-fit items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-950"><ArrowLeft size={14} /> Fabrication requests</Link>
      <PortalPageHeader eyebrow={`${request.request_type} / ${request.projects?.name || "Project"}`} title={request.title} description={request.description} action={<div className="flex gap-2"><StatusBadge value={request.priority} /><StatusBadge value={request.status} /></div>} />
      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-6">
          <form action={updateAction} className="grid gap-5 border border-zinc-200 bg-white p-5 md:grid-cols-2 md:p-7">
            <div className="md:col-span-2"><h2 className="text-xl font-semibold tracking-[-0.035em]">Execution controls</h2><p className="mt-1 text-xs text-zinc-500">Status changes are written to the request activity history.</p></div>
            <Field label="Status"><select name="status" defaultValue={request.status} disabled={!canUpdate} className={inputClass}>{["draft", "submitted", "assigned", "in_progress", "blocked", "ready", "complete", "cancelled"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></Field>
            <Field label="Priority"><select name="priority" defaultValue={request.priority} disabled={!canUpdate} className={inputClass}>{["low", "normal", "high", "urgent"].map((priority) => <option key={priority}>{priority}</option>)}</select></Field>
            <Field label="Needed by"><input type="date" name="needed_by" defaultValue={request.needed_by || ""} disabled={!canUpdate} className={inputClass} /></Field>
            <Field label="Assigned to"><select name="assigned_to" defaultValue={request.assigned_to || ""} disabled={!canUpdate} className={inputClass}><option value="">Unassigned</option>{workspace.profiles.filter((item) => ["admin", "operations", "project_manager"].includes(item.role)).map((person) => <option key={person.id} value={person.id}>{person.full_name || person.email}</option>)}</select></Field>
            <div className="md:col-span-2"><Field label="Internal notes"><textarea name="internal_notes" defaultValue={request.internal_notes} readOnly={!canUpdate} className={textareaClass} /></Field></div>
            {canUpdate ? <div className="md:col-span-2"><button className={primaryButtonClass}>Update request</button></div> : null}
          </form>

          <div className="border border-zinc-200 bg-white"><div className="border-b border-zinc-200 px-5 py-4"><h2 className="text-sm font-semibold">Drawing links</h2></div><div className="grid gap-2 p-5">{request.drawing_links.map((link) => <a key={link} href={link} target="_blank" rel="noreferrer" className="flex items-center justify-between border border-zinc-200 px-4 py-3 text-sm hover:border-zinc-400"><span className="truncate">{link}</span><ExternalLink size={14} /></a>)}{request.drawing_links.length === 0 ? <p className="text-sm text-zinc-500">No drawing links attached.</p> : null}</div></div>
        </div>

        <div className="grid h-fit gap-6">
          <div className="border border-zinc-200 bg-white"><div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4"><MessageSquare size={16} /><h2 className="text-sm font-semibold">Comments</h2></div><div className="max-h-96 divide-y divide-zinc-100 overflow-y-auto">{workspace.comments.map((comment) => <div key={comment.id} className="p-5"><div className="flex items-center justify-between gap-4"><p className="text-xs font-medium">{comment.profiles?.full_name || comment.profiles?.email || "1CG team"}</p><span className="font-mono text-[10px] text-zinc-400">{formatPortalDate(comment.created_at, true)}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600">{comment.body}</p></div>)}{workspace.comments.length === 0 ? <p className="p-5 text-sm text-zinc-500">No comments yet.</p> : null}</div><form action={commentAction} className="grid gap-3 border-t border-zinc-200 p-5"><textarea name="body" required placeholder="Add operational context" className={textareaClass} /><button className={primaryButtonClass}>Add comment</button></form></div>
          <div className="border border-zinc-200 bg-white"><div className="border-b border-zinc-200 px-5 py-4"><h2 className="text-sm font-semibold">Activity</h2></div><div className="divide-y divide-zinc-100">{workspace.activity.map((item) => <div key={item.id} className="p-5"><p className="text-sm font-medium">{item.action}</p><p className="mt-1 text-xs text-zinc-500">{item.profiles?.full_name || item.profiles?.email || "1CG team"} · {formatPortalDate(item.created_at, true)}</p></div>)}{workspace.activity.length === 0 ? <p className="p-5 text-sm text-zinc-500">No recorded activity.</p> : null}</div></div>
        </div>
      </section>
    </div>
  );
}
