import Link from "next/link";
import { ArrowRight, ClipboardCheck, Factory, FolderKanban, Megaphone } from "lucide-react";
import { PortalPageHeader, StatusBadge, formatPortalDate } from "@/components/portal/portal-ui";
import { approvalRoles, hasRole, requirePortalUser } from "@/lib/portal/auth";
import { listApprovals, listFabRequests, listProjects } from "@/lib/portal/data";

export default async function PortalDashboardPage() {
  const { profile } = await requirePortalUser();
  const [projects, requests, approvals] = await Promise.all([
    listProjects(),
    listFabRequests(),
    listApprovals("pending"),
  ]);
  const myProjects = projects.filter((project) => project.claimed_by === profile.id || project.created_by === profile.id);
  const myRequests = requests.filter((request) => request.assigned_to === profile.id || request.requested_by === profile.id);
  const pendingPublication = projects.filter((project) => project.public_visibility_status === "pending");

  const cards = [
    { label: "My projects", value: myProjects.length, href: "/portal/projects", icon: FolderKanban, note: `${projects.length} total` },
    { label: "My fab requests", value: myRequests.length, href: "/portal/fab-requests", icon: Factory, note: `${requests.filter((item) => item.status !== "complete").length} open` },
    { label: "Pending approvals", value: hasRole(profile, approvalRoles) ? approvals.length : "—", href: "/portal/approvals", icon: ClipboardCheck, note: "Content review" },
    { label: "Publication queue", value: pendingPublication.length, href: "/portal/publication-queue", icon: Megaphone, note: "Awaiting release" },
  ];

  return (
    <div className="grid gap-8">
      <PortalPageHeader
        eyebrow={`${profile.department || "1CG"} / ${profile.role.replaceAll("_", " ")}`}
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}.`}
        description="Projects, fabrication requests, approvals, and publishing status in one operational view."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, href, icon: Icon, note }) => (
          <Link key={label} href={href} className="group border border-zinc-200 bg-white p-5 transition hover:border-zinc-400">
            <div className="flex items-center justify-between text-zinc-400"><Icon size={18} /><ArrowRight size={15} className="transition group-hover:translate-x-0.5 group-hover:text-zinc-950" /></div>
            <div className="mt-8 text-4xl font-semibold tracking-[-0.055em]">{value}</div>
            <div className="mt-2 text-sm font-medium">{label}</div>
            <div className="mt-1 text-xs text-zinc-500">{note}</div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <h2 className="text-sm font-semibold">Recently updated projects</h2>
            <Link href="/portal/projects" className="text-xs text-zinc-500 hover:text-zinc-950">View all</Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {projects.slice(0, 6).map((project) => (
              <Link key={project.id} href={`/portal/projects/${project.id}`} className="grid gap-3 px-5 py-4 transition hover:bg-zinc-50 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div><p className="text-sm font-medium">{project.name}</p><p className="mt-1 text-xs text-zinc-500">{project.client_name || "Client pending"} · {project.location || "Location pending"}</p></div>
                <StatusBadge value={project.status} />
                <span className="font-mono text-[11px] text-zinc-400">{formatPortalDate(project.updated_at)}</span>
              </Link>
            ))}
            {projects.length === 0 ? <p className="p-6 text-sm text-zinc-500">No projects have been created.</p> : null}
          </div>
        </div>

        <div className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4"><h2 className="text-sm font-semibold">Due next</h2></div>
          <div className="divide-y divide-zinc-100">
            {requests.filter((item) => item.status !== "complete").slice(0, 6).map((request) => (
              <Link key={request.id} href={`/portal/fab-requests/${request.id}`} className="block px-5 py-4 transition hover:bg-zinc-50">
                <div className="flex items-start justify-between gap-4"><p className="text-sm font-medium">{request.title}</p><StatusBadge value={request.priority} /></div>
                <p className="mt-2 text-xs text-zinc-500">{request.projects?.name || "Project"} · {formatPortalDate(request.needed_by)}</p>
              </Link>
            ))}
            {requests.length === 0 ? <p className="p-6 text-sm text-zinc-500">No fabrication requests are due.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

