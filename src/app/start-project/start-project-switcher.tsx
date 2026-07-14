"use client";

import { ArrowRight, Building2, ClipboardCheck, FileUp } from "lucide-react";
import { useState } from "react";

const pages = [
  {
    title: "Start",
    kicker: "Project fit",
    tint: "#d8e8ff",
    icon: Building2,
    body: "Tell 1CG what is being built, where it is headed, and whether this is a budget, bid, VE, or design-assist conversation.",
  },
  {
    title: "Plans",
    kicker: "Submit documents",
    tint: "#f4f0e8",
    icon: FileUp,
    body: "Drawings, specs, addenda, bid dates, and scope notes are pinned to the preconstruction intake so estimating has one clean record.",
  },
  {
    title: "Review",
    kicker: "1CG routing",
    tint: "#dff6e8",
    icon: ClipboardCheck,
    body: "Public submissions and 1CG-created opportunities move into the same review path for assignment, follow-up, and status tracking.",
  },
] as const;

function pad(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function StartProjectSwitcher() {
  const [page, setPage] = useState(0);
  const current = pages[page];
  const Icon = current.icon;

  return (
    <div
      className="relative overflow-hidden border border-white/12 bg-black text-white"
      style={{ "--start-tint": current.tint } as React.CSSProperties}
    >
      <div
        key={current.title}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 origin-left animate-[projectDoorLeft_520ms_cubic-bezier(.76,0,.24,1)_both] bg-[var(--start-tint)]"
      />
      <div
        key={`${current.title}-right`}
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 origin-right animate-[projectDoorRight_520ms_cubic-bezier(.76,0,.24,1)_both] bg-[var(--start-tint)]"
      />

      <section className="relative min-h-[540px] p-6 md:p-10 lg:p-12">
        <div className="flex items-start justify-between gap-8">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/46">
            &gt; Page {pad(page)}
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/34">
            {pad(page)} / {pad(pages.length - 1)}
          </span>
        </div>

        <div className="mt-24 max-w-5xl md:mt-28">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/72">
            <Icon size={16} className="text-[var(--start-tint)]" />
            {current.kicker}
          </div>
          <h2 className="mt-6 text-[clamp(5rem,16vw,13rem)] font-semibold leading-[0.84] tracking-[-0.075em] text-[var(--start-tint)]">
            {current.title}
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/68">
            {current.body}
          </p>
        </div>

        <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-center gap-2 md:inset-x-10 md:bottom-10 lg:inset-x-12">
          {pages.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setPage(index)}
              data-active={index === page}
              className="h-11 border border-white/14 px-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white/62 transition hover:border-white/36 hover:text-white data-[active=true]:border-[var(--start-tint)] data-[active=true]:bg-[var(--start-tint)] data-[active=true]:text-black"
            >
              {item.title}
            </button>
          ))}
          <a
            href="#submit-plans"
            className="ml-0 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black transition hover:bg-white/88 md:ml-auto"
          >
            Submit Plans <ArrowRight size={15} />
          </a>
        </div>
      </section>

      <style jsx global>{`
        @keyframes projectDoorLeft {
          0% {
            transform: scaleX(1);
          }
          100% {
            transform: scaleX(0);
          }
        }

        @keyframes projectDoorRight {
          0% {
            transform: scaleX(1);
          }
          100% {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
}
