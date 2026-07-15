import Link from "next/link";
import { ArrowRight, Building2, Globe2, Mail, Phone } from "lucide-react";
import { EmptyState, PortalPageHeader } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { listCompanies } from "@/lib/portal/data";

export default async function PortalCompaniesPage() {
  await requirePortalUser("/portal/companies");
  const companies = await listCompanies();

  return (
    <div className="grid gap-8">
      <PortalPageHeader
        eyebrow="CRM / Companies"
        title="Companies"
        description="Private client and partner profiles linked to pursuits, project records, assets, and approvals."
      />

      {companies.length === 0 ? (
        <EmptyState
          title="No companies yet"
          body="Company profiles appear here after an administrator links one to a project."
        />
      ) : (
        <section className="grid gap-px border border-zinc-200 bg-zinc-200 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/portal/companies/${company.id}`}
              className="group min-h-64 bg-white p-6 transition hover:bg-zinc-50"
            >
              <div className="flex items-start justify-between gap-4">
                <Building2 size={20} className="text-zinc-400" />
                <ArrowRight size={16} className="text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-950" />
              </div>
              <h2 className="mt-10 text-2xl font-semibold leading-tight">{company.name}</h2>
              <p className="mt-2 text-sm text-zinc-500">
                {company.city}, {company.state} · {company.project_count} linked {company.project_count === 1 ? "project" : "projects"}
              </p>
              <div className="mt-6 grid gap-2 text-xs text-zinc-500">
                {company.website ? <span className="inline-flex items-center gap-2"><Globe2 size={13} /> {new URL(company.website).hostname}</span> : null}
                {company.email ? <span className="inline-flex items-center gap-2"><Mail size={13} /> {company.email}</span> : null}
                {company.phone ? <span className="inline-flex items-center gap-2"><Phone size={13} /> {company.phone}</span> : null}
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
