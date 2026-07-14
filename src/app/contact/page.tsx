import { Mail, MapPin, Phone } from "lucide-react";
import { PageShell } from "@/components/site-shell";

export default function ContactPage() {
  return (
    <PageShell>
      <main className="pt-16">
        <section className="mx-auto grid max-w-[1400px] gap-12 px-6 py-28 lg:grid-cols-12 lg:px-12 lg:py-36">
          <div className="lg:col-span-6">
            <p className="public-eyebrow">Contact</p>
            <h1 className="public-page-title mt-6">
              Direct Contact.
            </h1>
            <div className="mt-10 grid gap-4 text-muted">
              <span className="inline-flex items-center gap-3"><MapPin size={19} /> Charlotte · Atlanta · Charleston</span>
              <span className="inline-flex items-center gap-3"><Mail size={19} /> Estimating · Accounting · General inquiries</span>
              <span className="inline-flex items-center gap-3"><Phone size={19} /> Project team contact available on request</span>
            </div>
          </div>
          <form className="template-card grid gap-4 p-6 lg:col-span-6">
            {["Name", "Company", "Email", "Project Location"].map((label) => (
              <label key={label} className="grid gap-2 text-sm font-medium text-foreground">
                {label}
                <input className="h-12 rounded-full border border-border bg-white/80 px-4 text-foreground outline-none focus:border-foreground/30" />
              </label>
            ))}
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Project Scope
              <textarea className="min-h-32 rounded-2xl border border-border bg-white/80 p-4 text-foreground outline-none focus:border-foreground/30" />
            </label>
            <button className="h-12 rounded-full bg-foreground font-medium text-background transition hover:opacity-80">Submit Inquiry</button>
          </form>
        </section>
      </main>
    </PageShell>
  );
}
