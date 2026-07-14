import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/site-shell";

const services = [
  ["Commercial Glazing", "Glass and glazing execution for complex commercial construction teams."],
  ["Curtain Wall", "High-performance exterior glass systems for towers, civic buildings, education, healthcare, transportation, and mixed-use work."],
  ["Storefront & Entrances", "Durable public-facing systems where accessibility, hardware, first impressions, and schedule matter."],
  ["Window Wall", "Repeatable facade systems for residential, mixed-use, student housing, and high-rise apartment projects."],
  ["Interior Glass", "Transparent, polished separation for offices, campuses, healthcare, hospitality, research, and amenity spaces."],
  ["Heavy Glass", "Detailed interior and specialty glass where finish quality is visible at close range."],
  ["Integrated Cladding", "Facade coordination that brings glazing, cladding, entrances, storefront, and exterior detailing together."],
  ["Preconstruction", "Scope, systems, budget, sequencing, constructability, and risk evaluation before field work starts."],
  ["Fabrication", "Controlled shop production through a 100,000 sq. ft. Charlotte fabrication facility."],
  ["Installation", "Field execution coordinated around schedule, safety, quality, and enclosure performance."],
];

export default function ServicesPage() {
  return (
    <PageShell>
      <main className="pt-16">
        <section className="page-hero px-6 py-28 text-foreground lg:px-12 lg:py-36">
          <div className="relative mx-auto max-w-[1400px]">
            <p className="public-eyebrow">Services</p>
            <h1 className="public-page-title mt-6">
              Complete facade execution.
            </h1>
            <p className="mt-8 max-w-3xl text-xl leading-8 text-muted">
              Commercial glazing, curtain wall, storefront, window wall,
              interior glass, heavy glass, integrated cladding, preconstruction,
              fabrication, and installation.
            </p>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1400px] gap-4 px-6 py-20 md:grid-cols-2 xl:grid-cols-3 lg:px-12">
          {services.map(([title, body], index) => (
            <article key={title} className="template-card min-h-72 p-7 transition hover:shadow-[0_24px_80px_rgba(10,12,16,0.10)]">
              <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="public-card-title mt-8">{title}</h2>
              <p className="mt-4 leading-7 text-muted">{body}</p>
            </article>
          ))}
        </section>
        <section className="border-t border-border px-6 py-16 lg:px-12">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="public-card-title max-w-2xl text-3xl">Have drawings ready for scope review?</h2>
            <Link href="/send-plans" className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-82">
              Submit Plans <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
