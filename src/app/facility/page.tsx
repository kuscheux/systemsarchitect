"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Check, ExternalLink, Phone } from "lucide-react";
import { FormEvent, useState } from "react";
import { PageShell } from "@/components/site-shell";

const relatedArticles = [
  {
    source: "Glass Magazine",
    title: "Top 50 Glaziers",
    copy: "Industry context for the scale and national standing of leading glazing contractors.",
    href: "https://www.glassmagazine.com/top-50-glaziers",
  },
  {
    source: "1CG Portfolio",
    title: "Built Across the Southeast",
    copy: "See how the same preconstruction, fabrication, and installation discipline shows up across 72 portfolio projects.",
    href: "/projects",
  },
  {
    source: "Virtual Tour",
    title: "Charlotte Aerial Project Tour",
    copy: "A guided one-shot view of nearby work, built for teams who want to see project context before they meet.",
    href: "/virtual-aerial-tour",
  },
];

const inputClass =
  "h-12 rounded-full border border-border bg-white px-4 text-sm text-foreground outline-none transition focus:border-foreground/32";
const labelClass = "grid gap-2 text-sm font-medium text-foreground";

export default function FacilityPage() {
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageShell>
      <main>
        <section className="noise-overlay section-grid relative min-h-screen overflow-hidden bg-black px-6 py-36 text-white lg:px-12 lg:py-44">
          <video
            src="/videos/1cg-install-timeline.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-58 grayscale"
          />
          <div className="absolute inset-0 bg-black/72" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/42 to-black/12" />

          <div className="relative mx-auto max-w-[1400px]">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-white/58">
              Facility
            </p>
            <h1 className="mt-6 max-w-6xl text-6xl font-semibold leading-[0.9] tracking-[-0.07em] md:text-8xl">
              100,000 sq. ft. fabrication control.
            </h1>
            <p className="mt-8 max-w-3xl text-xl leading-8 text-white/64">
              Charlotte fabrication capacity gives 1CG greater control over
              quality, schedule, staging, repeatability, and project delivery.
            </p>
            <div className="mt-10">
              <Link
                href="/send-plans"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Submit Plans <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] gap-4 px-6 py-20 md:grid-cols-3 lg:px-12">
          {[
            ["Capabilities", "Fabrication capacity, staging, and repeatable shop execution."],
            ["Quality Control", "A tighter path from scope review to finished field installation."],
            ["Tour Request", "Bring the right people, see the process, and leave with next steps."],
          ].map(([item, copy], index) => (
            <a
              key={item}
              href={item === "Tour Request" ? "#tour-request" : "#articles"}
              className="template-card min-h-64 p-7 transition hover:shadow-[0_24px_80px_rgba(10,12,16,0.10)]"
            >
              <span className="font-mono text-xs text-muted">0{index + 1}</span>
              <h2 className="public-card-title mt-10">
                {item}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted">{copy}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                View details <ArrowRight size={16} />
              </span>
            </a>
          ))}
        </section>

        <section id="articles" className="border-y border-border bg-[#f2f1ed] px-6 py-20 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="public-eyebrow">
                  Related articles
                </p>
                <h2 className="public-section-title mt-4">
                  Context before the walkthrough.
                </h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-muted lg:ml-auto">
                Give visiting teams the proof first: industry standing, portfolio
                work, and the virtual Charlotte tour before they step inside.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {relatedArticles.map((article) => (
                <Link
                  key={article.title}
                  href={article.href}
                  target={article.href.startsWith("http") ? "_blank" : undefined}
                  rel={article.href.startsWith("http") ? "noreferrer" : undefined}
                  className="template-card min-h-72 p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(10,12,16,0.10)]"
                >
                  <p className="public-eyebrow">
                    {article.source}
                  </p>
                  <h3 className="public-card-title mt-8">
                    {article.title}
                  </h3>
                  <p className="mt-5 text-sm leading-6 text-muted">{article.copy}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium">
                    Open <ExternalLink size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="tour-request" className="px-6 py-24 lg:px-12">
          <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="lg:pt-8">
              <p className="public-eyebrow">
                Tour request
              </p>
              <h2 className="public-section-title mt-4">
                Schedule the walkthrough.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted">
                Pick a preferred date, tell us who is coming, and 1CG will
                confirm the tour by phone before it is locked in.
              </p>
              <div className="mt-8 grid gap-3 text-sm text-muted">
                {[
                  "Facility walkthrough",
                  "Project conversation",
                  "Fabrication and quality-control overview",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-background">
                      <Check size={14} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="template-card p-5 md:p-7">
              {submitted ? (
                <div className="grid min-h-[520px] place-items-center text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-foreground text-background">
                      <Phone size={22} />
                    </div>
                    <h3 className="mt-7 text-5xl font-semibold tracking-[-0.07em]">
                      Perfect.
                    </h3>
                    <p className="mx-auto mt-4 max-w-md text-lg leading-7 text-muted">
                      We will confirm via call!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-5">
                  <div className="flex items-center gap-3 border-b border-border pb-5">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background">
                      <CalendarDays size={19} />
                    </div>
                    <div>
                      <h3 className="public-card-title text-2xl">
                        Preferred tour window
                      </h3>
                      <p className="text-sm text-muted">
                        We will confirm availability before anything is final.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className={labelClass}>
                      Name
                      <input required className={inputClass} />
                    </label>
                    <label className={labelClass}>
                      Work Email
                      <input required type="email" className={inputClass} />
                    </label>
                    <label className={labelClass}>
                      Company
                      <input required className={inputClass} />
                    </label>
                    <label className={labelClass}>
                      Phone
                      <input required type="tel" className={inputClass} />
                    </label>
                    <label className={labelClass}>
                      Preferred Date
                      <input required type="date" className={inputClass} />
                    </label>
                    <label className={labelClass}>
                      Preferred Time
                      <input required type="time" className={inputClass} />
                    </label>
                    <label className={labelClass}>
                      Attendees
                      <select className={inputClass} defaultValue="2-4">
                        <option>1</option>
                        <option>2-4</option>
                        <option>5-8</option>
                        <option>9+</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Visit Type
                      <select className={inputClass} defaultValue="Facility tour">
                        <option>Facility tour</option>
                        <option>Project meeting</option>
                        <option>Fabrication review</option>
                        <option>GC / architect walkthrough</option>
                      </select>
                    </label>
                  </div>

                  <label className={labelClass}>
                    What should we prepare?
                    <textarea
                      className="min-h-32 rounded-[18px] border border-border bg-white p-4 text-sm text-foreground outline-none transition focus:border-foreground/32"
                      placeholder="Project type, scope questions, team goals, travel constraints..."
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-82"
                  >
                    Submit Tour Request <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
