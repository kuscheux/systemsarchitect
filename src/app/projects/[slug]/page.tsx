import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { projects } from "@/data/projects";
import { getPublicProject } from "@/lib/public-projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();

  const details = [
    ["Location", project.location],
    ["Region", project.region],
    ["Market", project.market],
    ["Project Type", project.projectType],
    ["1CG Scope", project.scope],
    ["Systems", project.systems],
    ["Completion", project.completion],
    ["General Contractor", project.generalContractor],
    ["Architect", project.architect],
    ["Owner", project.owner],
    ["Project Size", project.projectSize],
    ["Stories", project.stories],
  ];

  return (
    <PageShell>
      <main>
        <section className="noise-overlay relative min-h-[86vh] overflow-hidden bg-black text-white">
          {project.image ? (
            <Image src={project.image} alt="" fill priority sizes="100vw" className="ai-photo-image object-cover opacity-55" />
          ) : null}
          <video
            src={project.video}
            className="ai-photo-video absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 hover:opacity-50"
            muted
            loop
            playsInline
            autoPlay
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />
          <div className="relative mx-auto grid min-h-[86vh] max-w-[1400px] content-end px-6 pb-16 lg:px-12">
            <Link href="/projects" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white">
              <ArrowLeft size={17} /> All Projects
            </Link>
            <p className="font-mono text-sm uppercase tracking-[0.08em] text-white/55">
              {project.market} / {project.region}
            </p>
            <h1 className="mt-6 max-w-6xl text-7xl font-semibold leading-[0.88] tracking-[-0.075em] md:text-9xl">
              {project.name}
            </h1>
            <p className="mt-8 max-w-3xl text-xl leading-8 text-white/66">{project.description}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] gap-8 px-6 py-20 lg:grid-cols-12 lg:px-12">
          <aside className="template-card h-fit p-6 lg:col-span-4">
            <div className="grid gap-4">
              {details.map(([label, value]) => (
                <div key={label} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{label}</div>
                  <div className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</div>
                </div>
              ))}
            </div>
          </aside>
          <div className="grid gap-10 lg:col-span-8">
            {[
              ["Overview", project.overview],
              ["Challenge", project.challenge],
              ["1CG Solution", project.solution],
              ["Result", project.result],
            ].map(([title, body], index) => (
              <section key={title} className="border-t border-border pt-7">
                <span className="font-mono text-xs text-muted">0{index + 1}</span>
                <h2 className="public-card-title mt-3 text-4xl">{title}</h2>
                <p className="mt-4 text-xl leading-8 text-muted">{body}</p>
              </section>
            ))}
            <section id="gallery" className="border-t border-border pt-7">
              <span className="font-mono text-xs text-muted">05</span>
              <h2 className="public-card-title mt-3 text-4xl">Gallery</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {["Exterior", "Interior", "Detail", "Install / Progress"].map((label) => (
                  <div key={label} className="relative aspect-[1.35] overflow-hidden rounded-[18px] border border-border bg-black">
                    {project.image ? (
                      <Image src={project.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="ai-photo-image object-cover opacity-80" />
                    ) : null}
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 font-mono text-[11px] text-white/75 backdrop-blur">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <Link href="/send-plans" className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-80">
              Submit plans for a similar project <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
