import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { listPublishedJobs } from "@/lib/jobs/data";

const careerPaths = ["Field", "Fabrication", "Project Management", "Preconstruction"];

export const revalidate = 60;

export default async function CareersPage() {
  const jobs = await listPublishedJobs();

  return (
    <PageShell>
      <main className="pt-16">
        <section className="page-hero px-6 py-28 text-foreground lg:px-12 lg:py-36">
          <div className="relative mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="public-eyebrow">Careers</p>
              <h1 className="public-page-title mt-6">Build work that holds up.</h1>
            </div>
            <p className="self-end text-xl leading-8 text-muted lg:col-span-4">
              Join the field, fabrication, preconstruction, and project teams delivering complex glazing and facade systems across the Southeast.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <div className="flex flex-col gap-5 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="public-eyebrow">Open Positions</p>
              <h2 className="public-section-title mt-4">Current opportunities.</h2>
            </div>
            <p className="max-w-md text-base leading-7 text-muted">Every posting is maintained by the 1CG team. Closed roles are removed without losing their internal performance history.</p>
          </div>

          {jobs.length > 0 ? (
            <div className="divide-y divide-border border-b border-border">
              {jobs.map((job) => (
                <Link key={job.id} href={`/careers/${job.slug}`} className="group grid gap-5 py-8 transition hover:bg-black/[0.02] md:grid-cols-[minmax(0,1fr)_220px_32px] md:items-center md:px-4">
                  <div>
                    <p className="public-eyebrow">{job.department} / {job.employment_type}</p>
                    <h3 className="public-card-title mt-3 text-3xl">{job.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{job.summary}</p>
                  </div>
                  <div className="text-sm leading-6 text-muted">
                    <p className="inline-flex items-center gap-2"><MapPin size={14} /> {job.location}</p>
                    <p>{job.workplace_type}</p>
                  </div>
                  <ArrowRight size={20} className="transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-b border-border py-16">
              <h3 className="public-card-title text-3xl">No roles are currently posted.</h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted">Our needs change with the work. Send a resume through the contact page and tell us where you can contribute.</p>
              <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-medium">Introduce yourself <ArrowRight size={15} /></Link>
            </div>
          )}
        </section>

        <section className="mx-auto grid max-w-[1400px] gap-4 px-6 pb-20 md:grid-cols-2 xl:grid-cols-4 lg:px-12 lg:pb-28">
          {careerPaths.map((item, index) => (
            <div key={item} className="template-card min-h-56 p-7">
              <span className="font-mono text-xs text-muted">0{index + 1}</span>
              <h2 className="public-card-title mt-10">{item}</h2>
            </div>
          ))}
        </section>
      </main>
    </PageShell>
  );
}
