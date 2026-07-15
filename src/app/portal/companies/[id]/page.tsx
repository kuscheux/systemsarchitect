import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPinned,
  Phone,
  Presentation,
  UserRound,
} from "lucide-react";
import {
  PortalPageHeader,
  StatusBadge,
  formatPortalDate,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getCompanyWorkspace } from "@/lib/portal/data";

export default async function PortalCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requirePortalUser(`/portal/companies/${id}`);
  const workspace = await getCompanyWorkspace(id);
  if (!workspace.company) notFound();
  const company = workspace.company;
  const projectNames = new Map(workspace.projects.map((project) => [project.id, project.name]));
  const assetNames = new Map(workspace.assets.map((asset) => [asset.id, asset.title || "Project asset"]));

  return (
    <div className="grid gap-8">
      <Link href="/portal/companies" className="inline-flex w-fit items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-950">
        <ArrowLeft size={14} /> Companies
      </Link>

      <PortalPageHeader
        eyebrow="CRM / Company"
        title={company.name}
        description={`${company.primary_address}, ${company.city}, ${company.state} ${company.postal_code}`}
        action={
          <a href={company.website} target="_blank" rel="noreferrer" className={primaryButtonClass}>
            Company website <ExternalLink size={14} />
          </a>
        }
      />

      <section className="grid gap-px border border-zinc-200 bg-zinc-200 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Linked projects", String(workspace.projects.length)],
          ["Contacts", String(workspace.contacts.length)],
          ["Project assets", String(workspace.assets.length)],
          ["Approval events", String(workspace.approvals.length)],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-5">
            <p className="font-mono text-[10px] uppercase text-zinc-500">{label}</p>
            <p className="mt-4 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="border border-zinc-200 bg-white p-6 md:p-8">
          <div className="flex items-center gap-3 text-zinc-400"><Building2 size={19} /><span className="font-mono text-[10px] uppercase">Company profile</span></div>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">{company.description}</p>
          <div className="mt-8 grid gap-4 border-t border-zinc-200 pt-6 text-sm sm:grid-cols-2">
            <a href={`mailto:${company.email}`} className="inline-flex items-center gap-3 text-zinc-600 hover:text-zinc-950"><Mail size={16} /> {company.email}</a>
            <a href={`tel:${company.phone.replace(/[^0-9+]/g, "")}`} className="inline-flex items-center gap-3 text-zinc-600 hover:text-zinc-950"><Phone size={16} /> {company.phone}</a>
            <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-zinc-600 hover:text-zinc-950"><Globe2 size={16} /> {new URL(company.website).hostname}</a>
            <span className="inline-flex items-center gap-3 text-zinc-600"><MapPinned size={16} /> {company.city}, {company.state}</span>
          </div>
        </div>

        <aside className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4"><h2 className="text-sm font-semibold">Associated contacts</h2></div>
          <div className="divide-y divide-zinc-100">
            {workspace.contacts.map((contact) => (
              <div key={contact.id} className="p-5">
                <div className="flex items-start justify-between gap-4"><UserRound size={17} className="text-zinc-400" />{contact.is_primary ? <span className="font-mono text-[9px] uppercase text-zinc-400">Primary</span> : null}</div>
                <h3 className="mt-5 text-sm font-semibold">{contact.full_name}</h3>
                <p className="mt-1 text-xs text-zinc-500">{contact.title}</p>
                <div className="mt-4 grid gap-2 text-xs text-zinc-600">
                  {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : null}
                  {contact.phone ? <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}>{contact.phone}</a> : null}
                </div>
              </div>
            ))}
            {workspace.contacts.length === 0 ? <p className="p-5 text-sm text-zinc-500">No contacts linked.</p> : null}
          </div>
        </aside>
      </section>

      <section className="border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4"><h2 className="text-sm font-semibold">Projects and pursuits</h2></div>
        <div className="divide-y divide-zinc-100">
          {workspace.projects.map((project) => {
            const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(project.street_address || project.location)}`;
            return (
              <article key={project.id} className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-semibold">{project.name}</h3><StatusBadge value={project.status} /><StatusBadge value={project.public_visibility_status} /></div>
                  <p className="mt-2 text-sm text-zinc-500">{project.street_address || project.location}</p>
                  <p className="mt-4 max-w-4xl text-sm leading-6 text-zinc-600">{project.internal_description || project.overview}</p>
                  <div className="mt-5 border-l-2 border-zinc-950 pl-4"><p className="font-mono text-[9px] uppercase text-zinc-400">1CG scope</p><p className="mt-2 text-sm leading-6 text-zinc-700">{project.scope || "Scope pending"}</p></div>
                </div>
                <div className="flex flex-wrap gap-2 md:max-w-56 md:justify-end">
                  <Link href={`/portal/projects/${project.id}`} className={secondaryButtonClass}>Project record <ArrowRight size={14} /></Link>
                  {project.presentation_url ? <Link href={project.presentation_url} className={primaryButtonClass}><Presentation size={14} /> Presentation</Link> : null}
                  <a href={directions} target="_blank" rel="noreferrer" className={secondaryButtonClass}><MapPinned size={14} /> Map</a>
                </div>
              </article>
            );
          })}
          {workspace.projects.length === 0 ? <p className="p-6 text-sm text-zinc-500">No projects linked.</p> : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4"><h2 className="text-sm font-semibold">Project assets</h2></div>
          <div className="divide-y divide-zinc-100">
            {workspace.assets.map((asset) => (
              <a key={asset.id} href={`/api/portal/assets/${asset.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 p-5 transition hover:bg-zinc-50">
                <span><span className="block text-sm font-medium">{asset.title || "Untitled asset"}</span><span className="mt-1 block text-xs capitalize text-zinc-500">{asset.asset_type} · {formatPortalDate(asset.created_at)}</span></span>
                <FileText size={16} className="text-zinc-400" />
              </a>
            ))}
            {workspace.assets.length === 0 ? <p className="p-5 text-sm text-zinc-500">No assets linked yet.</p> : null}
          </div>
        </div>

        <div className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4"><h2 className="text-sm font-semibold">Approval history</h2></div>
          <div className="divide-y divide-zinc-100">
            {workspace.approvals.map((approval) => (
              <div key={approval.id} className="p-5">
                <div className="flex items-center justify-between gap-4"><span className="text-sm font-medium">{approval.entity_type === "project" ? projectNames.get(approval.entity_id) : assetNames.get(approval.entity_id)}</span><StatusBadge value={approval.status} /></div>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{approval.notes || "No reviewer notes."}</p>
                <p className="mt-3 font-mono text-[10px] text-zinc-400">{formatPortalDate(approval.reviewed_at || approval.created_at, true)}</p>
              </div>
            ))}
            {workspace.approvals.length === 0 ? <p className="p-5 text-sm text-zinc-500">No approval activity yet.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
