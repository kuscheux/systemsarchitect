import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { JobViewTracker } from "@/components/jobs/job-view-tracker";
import { PageShell } from "@/components/site-shell";
import { getPublishedJob } from "@/lib/jobs/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJob(slug);
  if (!job) return { title: "Careers | 1CG" };
  return {
    title: `${job.title} | 1CG Careers`,
    description: job.summary,
  };
}

export default async function JobPostingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getPublishedJob(slug);
  if (!job) notFound();

  const applyHref = job.application_url || (job.application_email ? `mailto:${job.application_email}?subject=${encodeURIComponent(`${job.title} application`)}` : "/contact");
  const external = Boolean(job.application_url);

  return (
    <PageShell>
      <JobViewTracker slug={job.slug} />
      <main className="pt-16">
        <section className="page-hero px-6 py-24 text-foreground lg:px-12 lg:py-32">
          <div className="relative mx-auto max-w-[1400px]">
            <Link href="/careers" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground">
              <ArrowLeft size={15} /> All careers
            </Link>
            <p className="public-eyebrow mt-14">{job.department} / {job.employment_type}</p>
            <h1 className="public-page-title mt-6 max-w-6xl">{job.title}</h1>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-base text-muted">
              <span className="inline-flex items-center gap-2"><MapPin size={16} /> {job.location}</span>
              <span>{job.workplace_type}</span>
              {job.compensation ? <span>{job.compensation}</span> : null}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-12 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-2xl font-medium leading-9 tracking-[-0.025em] text-foreground">{job.summary}</p>
            <div className="mt-14 grid gap-5 text-base leading-8 text-muted">
              {job.description.split(/\n\s*\n/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>

            {job.responsibilities.length > 0 ? (
              <section className="mt-16 border-t border-border pt-10">
                <h2 className="public-card-title text-3xl">What you will do</h2>
                <ul className="mt-7 grid gap-4 text-base leading-7 text-muted">
                  {job.responsibilities.map((item) => <li key={item} className="grid grid-cols-[12px_1fr] gap-3"><span className="mt-3 h-1 w-1 bg-foreground" />{item}</li>)}
                </ul>
              </section>
            ) : null}

            {job.qualifications.length > 0 ? (
              <section className="mt-16 border-t border-border pt-10">
                <h2 className="public-card-title text-3xl">What you bring</h2>
                <ul className="mt-7 grid gap-4 text-base leading-7 text-muted">
                  {job.qualifications.map((item) => <li key={item} className="grid grid-cols-[12px_1fr] gap-3"><span className="mt-3 h-1 w-1 bg-foreground" />{item}</li>)}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="h-fit border-t border-foreground bg-foreground p-7 text-background lg:sticky lg:top-28">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-background/55">Join 1CG</p>
            <h2 className="public-card-title mt-6">Build work that holds up.</h2>
            <p className="mt-4 text-sm leading-6 text-background/65">Send your information for a direct review by the 1CG team.</p>
            <Link href={applyHref} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-background px-5 text-sm font-medium text-foreground">
              Apply for this role <ArrowUpRight size={15} />
            </Link>
          </aside>
        </section>
      </main>
    </PageShell>
  );
}

