import { PageShell } from "@/components/site-shell";

const items = ["Leadership / Founder Story", "Charlotte HQ", "Atlanta Office", "Charleston Office", "Values", "Safety", "Quality"];

export default function CompanyPage() {
  return (
    <PageShell>
      <main className="pt-16">
        <section className="page-hero px-6 py-28 text-foreground lg:px-12 lg:py-36">
          <div className="relative mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="public-eyebrow">Company</p>
              <h1 className="public-page-title mt-6">
                Built for complex construction.
              </h1>
            </div>
            <p className="self-end text-xl leading-8 text-muted lg:col-span-4">
              1CG supports general contractors, architects, developers,
              institutions, and owners with commercial glazing and facade systems
              across the Southeast.
            </p>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1400px] gap-4 px-6 py-20 md:grid-cols-2 xl:grid-cols-4 lg:px-12">
          {items.map((item, index) => (
            <div key={item} className="template-card min-h-44 p-6">
              <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="public-card-title mt-8">{item}</h2>
            </div>
          ))}
        </section>
      </main>
    </PageShell>
  );
}
