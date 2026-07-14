import { PageShell } from "@/components/site-shell";
import { ProjectExplorer } from "@/components/project-explorer";
import { markets, regions } from "@/data/projects";
import { getPublicProjects } from "@/lib/public-projects";

export default async function ProjectsPage() {
  const projects = await getPublicProjects();
  return (
    <PageShell>
      <main className="pt-16">
        <section className="page-hero px-6 py-28 text-foreground lg:px-12 lg:py-36">
          <div className="relative mx-auto max-w-[1400px]">
            <p className="public-eyebrow">
              Projects
            </p>
            <h1 className="public-page-title mt-6">
              Built Across the Southeast
            </h1>
            <p className="mt-8 max-w-3xl text-xl leading-8 text-muted">
              Explore 1CG&apos;s commercial glazing, facade, storefront, curtain
              wall, interior glass, education, healthcare, civic, hospitality,
              residential, mixed-use, industrial, and transportation projects.
            </p>
          </div>
        </section>
        <ProjectExplorer projects={projects} regions={regions} markets={markets} />
      </main>
    </PageShell>
  );
}
