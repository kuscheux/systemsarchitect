import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Field, PortalPageHeader, inputClass, primaryButtonClass, secondaryButtonClass, textareaClass } from "@/components/portal/portal-ui";
import { createFabRequestAction } from "@/lib/portal/actions";
import { assertRole, fabCreatorRoles, requirePortalUser } from "@/lib/portal/auth";
import { listProfiles, listProjects } from "@/lib/portal/data";

export default async function NewFabRequestPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const [{ profile }, projects, profiles, params] = await Promise.all([
    requirePortalUser("/portal/fab-requests/new"),
    listProjects(),
    listProfiles(),
    searchParams,
  ]);
  assertRole(profile, fabCreatorRoles);
  const assignable = profiles.filter((item) => ["admin", "operations", "project_manager"].includes(item.role));
  return (
    <div className="grid gap-8">
      <PortalPageHeader eyebrow="Fabrication / New" title="Submit fab request" description="Give the shop a clear need, date, source drawings, and accountable owner." />
      <form action={createFabRequestAction} className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-5 border border-zinc-200 bg-white p-5 md:grid-cols-2 md:p-7">
          <Field label="Project"><select name="project_id" required defaultValue={params.project || ""} className={inputClass}><option value="" disabled>Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field>
          <Field label="Request title"><input name="title" required placeholder="Lobby entrance frames" className={inputClass} /></Field>
          <Field label="Request type"><select name="request_type" className={inputClass}><option value="frames">Frames</option><option value="panels">Panels</option><option value="hardware">Hardware</option><option value="rework">Rework</option><option value="material">Material</option><option value="other">Other</option></select></Field>
          <Field label="Priority"><select name="priority" defaultValue="normal" className={inputClass}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></Field>
          <Field label="Needed by"><input type="date" name="needed_by" className={inputClass} /></Field>
          <Field label="Assign to"><select name="assigned_to" className={inputClass}><option value="">Unassigned</option>{assignable.map((person) => <option key={person.id} value={person.id}>{person.full_name || person.email} · {person.role.replaceAll("_", " ")}</option>)}</select></Field>
          <div className="md:col-span-2"><Field label="Description"><textarea name="description" required className={textareaClass} /></Field></div>
          <div className="md:col-span-2"><Field label="Drawing links" hint="One URL per line. These links remain internal."><textarea name="drawing_links" className={textareaClass} /></Field></div>
          <div className="md:col-span-2"><Field label="Internal notes"><textarea name="internal_notes" className={textareaClass} /></Field></div>
        </div>
        <aside className="h-fit border border-zinc-200 bg-white p-5"><h2 className="text-sm font-semibold">Request standard</h2><ul className="mt-4 grid gap-3 text-sm leading-6 text-zinc-500"><li>Reference the exact project and scope.</li><li>Set a realistic needed-by date.</li><li>Link the current drawing set.</li><li>Use urgent only for a verified schedule impact.</li></ul><div className="mt-6 grid gap-2"><button className={primaryButtonClass}>Submit request</button><Link href="/portal/fab-requests" className={secondaryButtonClass}><ArrowLeft size={14} /> Cancel</Link></div></aside>
      </form>
    </div>
  );
}

