import Link from "next/link";
import { ArrowRight, MapPinned, Plus, Search } from "lucide-react";
import { EmptyState, PortalPageHeader, StatusBadge, formatPortalDate, inputClass, primaryButtonClass } from "@/components/portal/portal-ui";
import { hasRole, projectCreatorRoles, requirePortalUser } from "@/lib/portal/auth";
import { listProjects } from "@/lib/portal/data";

export default async function PortalProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const [{ profile }, params] = await Promise.all([requirePortalUser("/portal/projects"), searchParams]);
  const projects = await listProjects({ query: params.q, status: params.status });
  const canCreate = hasRole(profile, projectCreatorRoles);

  return (
    <div className="grid gap-8">
      <PortalPageHeader eyebrow="Project controls" title="Projects" description="Internal project records and the approved content path to the public website." action={<div className="flex flex-wrap gap-2"><Link href="/portal/projects/map" className={primaryButtonClass}><MapPinned size={15} /> Project map</Link>{canCreate ? <Link href="/portal/projects/new" className={primaryButtonClass}><Plus size={15} /> New project</Link> : null}</div>} />
      <form className="grid gap-3 border border-zinc-200 bg-white p-3 md:grid-cols-[1fr_180px_auto]">
        <label className="relative"><Search size={16} className="absolute left-3 top-3.5 text-zinc-400" /><input name="q" defaultValue={params.q} placeholder="Search name, client, or location" className={`${inputClass} pl-10`} /></label>
        <select name="status" defaultValue={params.status || "all"} className={inputClass}><option value="all">All statuses</option><option value="pending">Pending</option><option value="active">Active</option><option value="on_hold">On hold</option><option value="complete">Complete</option><option value="archived">Archived</option></select>
        <button className={primaryButtonClass}>Apply filters</button>
      </form>

      {projects.length === 0 ? (
        <EmptyState title="No projects found" body="Create the first portal project or adjust the current filters." action={canCreate ? <Link href="/portal/projects/new" className={primaryButtonClass}>Create project</Link> : undefined} />
      ) : (
        <div className="overflow-x-auto border border-zinc-200 bg-white">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-zinc-200 bg-zinc-50 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-500"><tr><th className="px-5 py-3 font-medium">Project</th><th className="px-4 py-3 font-medium">Market</th><th className="px-4 py-3 font-medium">Internal</th><th className="px-4 py-3 font-medium">Public</th><th className="px-4 py-3 font-medium">Updated</th><th className="px-5 py-3" /></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {projects.map((project) => (
                <tr key={project.id} className="group hover:bg-zinc-50">
                  <td className="px-5 py-4"><p className="text-sm font-medium">{project.name}</p><p className="mt-1 text-xs text-zinc-500">{project.client_name || "Client pending"} · {project.location || "Location pending"}</p></td>
                  <td className="px-4 py-4 text-sm text-zinc-600">{project.market || "—"}</td>
                  <td className="px-4 py-4"><StatusBadge value={project.status} /></td>
                  <td className="px-4 py-4"><StatusBadge value={project.public_visibility_status} /></td>
                  <td className="px-4 py-4 font-mono text-[11px] text-zinc-500">{formatPortalDate(project.updated_at)}</td>
                  <td className="px-5 py-4 text-right"><Link href={`/portal/projects/${project.id}`} className="inline-flex items-center gap-2 text-xs font-medium">Open <ArrowRight size={14} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
