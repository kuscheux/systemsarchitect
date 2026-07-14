import Link from "next/link";
import { ArrowDown, ArrowRight, Phone } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { SendPlansForm } from "./send-plans-form";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const stats = [
  ["#14", "National contract glazier"],
  ["2005", "Founded"],
  ["100,000 SF", "In-house fabrication"],
  ["07 + 08", "Envelope coordination"],
] as const;

const steps = [
  {
    number: "01",
    title: "Submit Plans",
    body: "Send drawings, specifications, addenda, bid date, and the project context our estimators need.",
  },
  {
    number: "02",
    title: "Estimating Reviews Scope",
    body: "We review Division 07 and 08 scope, system conflicts, delegated design requirements, and schedule pressure points.",
  },
  {
    number: "03",
    title: "Receive Clear Direction",
    body: "Depending on project stage, we return a scoped proposal, budget direction, VE path, or design-assist conversation.",
  },
] as const;

const lifecycle = [
  "Estimating",
  "Award",
  "Preconstruction / Design-Assist",
  "Fabrication",
  "Installation",
] as const;

const faqs = [
  {
    question: "What happens after I submit plans?",
    answer:
      "Estimating reviews the bid documents, confirms fit and timing, and follows up for missing scope information before proposal work begins.",
  },
  {
    question: "Do you handle design-assist?",
    answer:
      "Yes. Design-assist typically begins after alignment on commercial fit and project intent, with estimating and preconstruction working in sequence.",
  },
  {
    question: "Can 1CG review Division 07 / 08 coordination issues?",
    answer:
      "Yes. We can flag interface risk between glazing, cladding, waterproofing, entrances, fire-rated assemblies, and delegated-design requirements.",
  },
  {
    question: "What files should I send?",
    answer:
      "Current architectural drawings, specifications, addenda, relevant structural details, bid instructions, and the project schedule are the best starting point.",
  },
  {
    question: "Do you work outside your core markets?",
    answer:
      "1CG evaluates work by scope, schedule, logistics, and team fit. Submit the project location and documents so the team can make a specific determination.",
  },
  {
    question: "Can you provide budget pricing before full CDs?",
    answer:
      "Yes, when the available design information supports a responsible budget. We will identify assumptions and gaps rather than hide them in a number.",
  },
] as const;

export default async function SendPlansPage() {
  let signedInEmail = "";
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getClaims();
      if (typeof data?.claims?.email === "string") signedInEmail = data.claims.email;
    } catch {
      signedInEmail = "";
    }
  }

  return (
    <PageShell>
      <main className="bg-background pt-20">
        <section className="border-b border-border px-6 pb-16 pt-20 lg:px-12 lg:pb-24 lg:pt-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="min-w-0 lg:col-span-8">
                <p className="public-eyebrow">Preconstruction Intake</p>
                <h1 className="public-page-title send-plans-title mt-6 max-w-6xl">
                  Submit Plans for Preconstruction Review
                </h1>
              </div>
              <div className="min-w-0 lg:col-span-4">
                <p className="text-lg leading-8 text-muted">
                  Partner with a #14 national contract glazier for serious
                  commercial envelope work. We align estimating with Division
                  07 and 08 scope review before preconstruction begins.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-5">
                  <Link
                    href="#project-intake"
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-82"
                  >
                    Submit Plans <ArrowDown size={16} />
                  </Link>
                  <a
                    href="tel:+17042917711"
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:opacity-60"
                  >
                    <Phone size={15} /> Schedule a Façade Strategy Call
                  </a>
                </div>
              </div>
            </div>

            <dl className="mt-16 grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(([value, label]) => (
                <div
                  key={label}
                  className="border-b border-border py-6 sm:px-5 sm:first:pl-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <dt className="text-3xl font-semibold tracking-[-0.055em]">{value}</dt>
                  <dd className="mt-2 text-sm text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="px-6 py-20 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
              <div>
                <p className="public-eyebrow">What Happens Next</p>
                <h2 className="public-section-title mt-5">A disciplined first review.</h2>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-muted lg:ml-auto">
                The process starts with estimating. Preconstruction and
                design-assist follow award and alignment, then the work moves
                through controlled fabrication and field installation.
              </p>
            </div>

            <div className="mt-12 grid border-l border-t border-border md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="min-h-72 border-b border-r border-border bg-white p-6 md:p-8"
                >
                  <span className="font-mono text-xs text-muted">{step.number}</span>
                  <h3 className="public-card-title mt-12">{step.title}</h3>
                  <p className="mt-5 max-w-sm text-sm leading-7 text-muted">{step.body}</p>
                </article>
              ))}
            </div>

            <ol className="mt-5 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-5">
              {lifecycle.map((item, index) => (
                <li key={item} className="flex min-h-20 items-center gap-3 bg-background px-5 py-4">
                  <span className="font-mono text-[10px] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium leading-5">{item}</span>
                  {index < lifecycle.length - 1 ? (
                    <ArrowRight className="ml-auto hidden text-muted md:block" size={14} />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="project-intake" className="scroll-mt-24 border-y border-border bg-[#f1f0ec] px-6 py-20 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="max-w-3xl">
              <p className="public-eyebrow">Project Intake</p>
              <h2 className="public-section-title mt-5">Give estimating a clean first look.</h2>
              <p className="mt-6 text-lg leading-8 text-muted">
                Send the current documents and the facts that affect scope,
                schedule, system selection, and commercial fit.
              </p>
            </div>
            <SendPlansForm signedInEmail={signedInEmail} />
          </div>
        </section>

        <section className="px-6 py-20 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr]">
              <div>
                <p className="public-eyebrow">Frequently Asked</p>
                <h2 className="public-section-title mt-5">Before you send the set.</h2>
              </div>
              <div className="border-t border-border">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group border-b border-border py-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-semibold tracking-[-0.035em]">
                      {faq.question}
                      <span className="text-muted transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="max-w-3xl pt-4 text-base leading-7 text-muted">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-foreground px-6 py-20 text-background lg:px-12 lg:py-28">
          <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/52">
                Scope clarity before cost exposure
              </p>
              <h2 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.94] tracking-[-0.055em] md:text-7xl">
                Bring 1CG in before the envelope gets expensive.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/58">
                Start with estimating, define the scope, and surface envelope
                risk early enough to protect the schedule.
              </p>
            </div>
            <a
              href="tel:+17042917711"
              className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black transition hover:bg-white/88"
            >
              Schedule a Façade Strategy Call <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
