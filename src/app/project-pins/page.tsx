import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Expand, MapPin, Upload } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { requireEmployeePortalUser } from "@/lib/portal/auth";

export const metadata: Metadata = {
  title: "Project Pins | 1CG",
  description:
    "Project Pins gives each 1CG pursuit a location, media deck, presentation view, and path to become a live portfolio page.",
};

const cards = [
  {
    title: "Pin the pursuit",
    body: "Create a private project page before the work is public.",
  },
  {
    title: "Present the scope",
    body: "Use one link for video, drawings, systems, schedule, and next steps.",
  },
  {
    title: "Publish the proof",
    body: "When the project is complete, the same pin becomes a portfolio case study.",
  },
];

export default async function ProjectPinsPage() {
  await requireEmployeePortalUser("/project-pins");
  return (
    <PageShell>
      <main className="bg-background text-foreground">
        <section className="relative min-h-screen overflow-hidden bg-black text-white">
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale"
            src="/videos/magnolia/magnolia-timelapse.mp4"
            poster="/videos/magnolia/magnolia-timelapse-cover.jpg"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9),rgba(0,0,0,0.38),rgba(0,0,0,0.18))]" />
          <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col justify-end px-6 pb-16 pt-36 md:px-12 lg:px-16">
            <p className="public-eyebrow text-white/58">Project Pins</p>
            <h1 className="mt-5 max-w-6xl text-[clamp(4rem,12vw,13rem)] font-semibold leading-[0.83] tracking-[-0.08em]">
              A pin becomes the project.
            </h1>
            <div className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_0.3fr] lg:items-end">
              <p className="max-w-3xl text-xl leading-8 text-white/72">
                Give every pursuit a place, a story, a presentation, and a direct path to become
                published work when the building is ready.
              </p>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="/project-pins/magnolia"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black"
                >
                  Open Magnolia <ArrowRight size={16} />
                </Link>
                <Link
                  href="/#locations"
                  className="inline-flex items-center gap-2 rounded-full border border-white/24 px-5 py-3 text-sm font-medium text-white"
                >
                  View Map <MapPin size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-6 md:px-12 lg:px-20">
          <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-3">
            {cards.map((card, index) => (
              <article key={card.title} className="template-card min-h-[260px] p-7">
                <p className="public-eyebrow">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="public-card-title mt-8 text-4xl text-foreground">
                  {card.title}
                </h2>
                <p className="mt-5 text-base leading-7 text-muted">{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-6 md:px-12 lg:px-20">
          <div className="mx-auto grid max-w-[1500px] overflow-hidden border border-border bg-[#f2f2ef] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-8 md:p-12">
              <p className="public-eyebrow">Media Pipeline</p>
              <h2 className="mt-5 max-w-2xl text-[clamp(3.4rem,8vw,8rem)] font-semibold leading-[0.86] tracking-[-0.078em]">
                Built for clean playback.
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-muted">
                Upload source video at any size, keep the original asset, and render stakeholder
                presentations in a fixed 16:9 stage. The production pipeline is ready for 8K masters
                once the render worker is connected.
              </p>
              <Link
                href="/start-project"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
              >
                Start a Project Pin <Upload size={16} />
              </Link>
            </div>
            <div className="relative min-h-[420px]">
              <Image
                src="/images/magnolia/01-southeast-oblique.png"
                alt="Magnolia Landing exterior envelope visualization"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/36 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-full bg-white/88 px-5 py-3 text-sm font-medium text-black backdrop-blur-xl">
                <span>Magnolia Landing</span>
                <span className="inline-flex items-center gap-2">
                  16:9 Presentation <Expand size={14} />
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
