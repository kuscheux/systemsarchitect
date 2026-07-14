import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { EmptyState, PortalPageHeader, StatusBadge, formatPortalDate, inputClass, primaryButtonClass } from "@/components/portal/portal-ui";
import { fabCreatorRoles, hasRole, requirePortalUser } from "@/lib/portal/auth";
import { listFabRequests } from "@/lib/portal/data";

export default async function FabRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string; priority?: string }> }) {
  const [{ profile }, params] = await Promise.all([requirePortalUser("/portal/fab-requests"), searchParams]);
  const requests = await listFabRequests(params);
  const canCreate = hasRole(profile, fabCreatorRoles);
  return (
    <div className="grid gap-8">
      <PortalPageHeader eyebrow="Operations" title="Fabrication requests" description="A controlled handoff from project need to shop execution, with ownership and status history." action={canCreate ? <Link href="/portal/fab-requests/new" className={primaryButtonClass}><Plus size={15} /> New request</Link> : undefined} />
      <form className="grid gap-3 border border-zinc-200 bg-white p-3 sm:grid-cols-[200px_200px_auto]">
        <select name="status" defaultValue={params.status || "all"} className={inputClass}><option value="all">All statuses</option>{["draft", "submitted", "assigned", "in_progress", "blocked", "ready", "complete", "cancelled"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>
        <select name="priority" defaultValue={params.priority || "all"} className={inputClass}><option value="all">All priorities</option>{["low", "normal", "high", "urgent"].map((priority) => <option key={priority}>{priority}</option>)}</select>
        <button className={primaryButtonClass}>Apply filters</button>
      </form>
      {requests.length === 0 ? <EmptyState title="No requests found" body="Create a fabrication request or change the current filters." action={canCreate ? <Link href="/portal/fab-requests/new" className={primaryButtonClass}>Create request</Link> : undefined} /> : (
        <div className="overflow-x-auto border border-zinc-200 bg-white"><table className="w-full min-w-[920px] text-left"><thead className="border-b border-zinc-200 bg-zinc-50 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500"><tr><th className="px-5 py-3 font-medium">Request</th><th className="px-4 py-3 font-medium">Project</th><th className="px-4 py-3 font-medium">Priority</th><th className="px-4 py-3 font-medium">Needed</th><th className="px-4 py-3 font-medium">Status</th><th /></tr></thead><tbody className="divide-y divide-zinc-100">{requests.map((request) => <tr key={request.id} className="hover:bg-zinc-50"><td className="px-5 py-4"><p className="text-sm font-medium">{request.title}</p><p className="mt-1 text-xs capitalize text-zinc-500">{request.request_type}</p></td><td className="px-4 py-4 text-sm text-zinc-600">{request.projects?.name || "—"}</td><td className="px-4 py-4"><StatusBadge value={request.priority} /></td><td className="px-4 py-4 font-mono text-[11px] text-zinc-500">{formatPortalDate(request.needed_by)}</td><td className="px-4 py-4"><StatusBadge value={request.status} /></td><td className="px-5 py-4 text-right"><Link href={`/portal/fab-requests/${request.id}`} className="inline-flex items-center gap-2 text-xs font-medium">Open <ArrowRight size={14} /></Link></td></tr>)}</tbody></table></div>
      )}
    </div>
  );
}

