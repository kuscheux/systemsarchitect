import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Field, PortalPageHeader, inputClass, primaryButtonClass, secondaryButtonClass, textareaClass } from "@/components/portal/portal-ui";
import { createProjectAction } from "@/lib/portal/actions";
import { assertRole, projectCreatorRoles, requirePortalUser } from "@/lib/portal/auth";
import { listCompanies } from "@/lib/portal/data";

export default async function NewPortalProjectPage() {
  const { profile } = await requirePortalUser("/portal/projects/new");
  assertRole(profile, projectCreatorRoles);
  const companies = await listCompanies();
  return (
    <div className="grid gap-8">
      <PortalPageHeader eyebrow="Projects / New" title="Create project" description="Start with internal project facts. Public content remains private until approval and publication." />
      <form action={createProjectAction} className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-5 border border-zinc-200 bg-white p-5 md:grid-cols-2 md:p-7">
          <Field label="Project name"><input name="name" required className={inputClass} /></Field>
          <Field label="URL slug" hint="Leave blank to generate from the project name."><input name="slug" className={inputClass} /></Field>
          <Field label="Client"><input name="client_name" className={inputClass} /></Field>
          <Field label="Company"><select name="company_id" className={inputClass}><option value="">No company linked</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></Field>
          <Field label="Location"><input name="location" placeholder="Charlotte, NC" className={inputClass} /></Field>
          <Field label="Market"><input name="market" placeholder="Office" className={inputClass} /></Field>
          <Field label="Project type"><input name="project_type" placeholder="High-rise commercial" className={inputClass} /></Field>
          <Field label="Status"><select name="status" className={inputClass}><option value="pending">Pending</option><option value="active">Active</option><option value="on_hold">On hold</option><option value="complete">Complete</option></select></Field>
          <div className="md:col-span-2"><Field label="Internal description"><textarea name="internal_description" className={textareaClass} /></Field></div>
          <div className="md:col-span-2"><Field label="Public description" hint="This cannot appear publicly until it passes approval."><textarea name="public_description" className={textareaClass} /></Field></div>
        </div>
        <aside className="h-fit border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold">Before creating</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Use verified project facts. Drawing links, fabrication details, and internal notes belong in their protected workflows, not the public description.</p>
          <div className="mt-6 grid gap-2"><button className={primaryButtonClass}>Create project</button><Link href="/portal/projects" className={secondaryButtonClass}><ArrowLeft size={14} /> Cancel</Link></div>
        </aside>
      </form>
    </div>
  );
}
