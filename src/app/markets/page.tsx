import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { markets, projects } from "@/data/projects";

const copy: Record<string, string> = {
  Education: "Durable systems, clear circulation, safe entrances, daylight-friendly learning environments, and long-term maintenance performance.",
  "Mixed-Use": "Facade systems serving retail, residential, office, parking, public plazas, amenities, and street-level activation at once.",
  Residential: "Livability, exterior identity, daylight, durability, and amenity experience across repeated units and shared spaces.",
  Office: "Light, transparency, performance, and clean architectural execution for modern workplace expectations.",
  Healthcare: "Safety, accessibility, patient experience, cleanability, and long-term reliability.",
  "Civic/Government": "Public durability, security awareness, accessibility, and long-term performance.",
  Hospitality: "Arrival experience, finish quality, views, amenity space, and architectural detail.",
  Industrial: "Durable, practical, coordinated systems for manufacturing and public-facing facility areas.",
  Transportation: "High-traffic durability, coordination, security awareness, and demanding operational performance.",
};

export default function MarketsPage() {
  return (
    <PageShell>
      <main className="pt-16">
        <section className="page-hero px-6 py-28 text-foreground lg:px-12 lg:py-36">
          <div className="relative mx-auto max-w-[1400px]">
            <p className="public-eyebrow">Markets</p>
            <h1 className="public-page-title mt-6">
              Proof across every major market.
            </h1>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1400px] gap-4 px-6 py-20 md:grid-cols-2 xl:grid-cols-3 lg:px-12">
          {markets.map((market) => {
            const reps = projects.filter((project) => project.market === market).slice(0, 4);
            return (
              <article key={market} className="template-card min-h-80 p-7">
                <div className="mb-8 font-mono text-xs uppercase tracking-[0.08em] text-muted">
                  {reps.length} representative projects
                </div>
                <h2 className="public-card-title">{market}</h2>
                <p className="mt-4 min-h-28 leading-7 text-muted">
                  {copy[market] || "Specialized environments require coordinated glass, glazing, entrance, and facade systems matched to the building use."}
                </p>
                <div className="mt-7 grid gap-2 text-sm font-medium text-foreground">
                  {reps.map((project) => (
                    <Link key={project.slug} href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 hover:opacity-70">
                      {project.name} <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </PageShell>
  );
}
