"use client";

import type { CSSProperties } from "react";
import type { PursuitScene } from "@/data/pursuits/types";

type InstallationGanttSceneProps = {
  scene: PursuitScene;
};

type SchedulePhase = "procurement" | "installation" | "closeout";

type ScheduleRow = {
  id: string;
  label: string;
  duration: string;
  owner?: string;
  phase: SchedulePhase;
  startPct: number;
  widthPct: number;
};

type BarStyle = CSSProperties & {
  "--bar-left": string;
  "--bar-width": string;
  "--bar-delay": string;
};

const quarters = ["Q2 '26", "Q3 '26", "Q4 '26", "Q1 '27", "Q2 '27", "Q3 '27", "Q4 '27"];

const scheduleRows: ScheduleRow[] = [
  { id: "design-assist", label: "Design Assist", duration: "82d", owner: "1CG / ES", phase: "procurement", startPct: 1, widthPct: 17.5 },
  { id: "pricing-award", label: "Pricing and Award", duration: "93d", phase: "procurement", startPct: 18.7, widthPct: 20 },
  { id: "submittal-procurement", label: "Submittal Procurement", duration: "64d", owner: "1CG / ES", phase: "procurement", startPct: 39.2, widthPct: 13.8 },
  { id: "submittal-review", label: "Submittal Review & Approval", duration: "10d", owner: "Architect", phase: "procurement", startPct: 53.2, widthPct: 2.1 },
  { id: "material-procurement", label: "Material Procurement", duration: "123d", owner: "1CG / ES", phase: "procurement", startPct: 55.3, widthPct: 26.7 },
  { id: "level-1", label: "Level 1", duration: "25d", phase: "installation", startPct: 74.8, widthPct: 5.4 },
  { id: "level-2", label: "Level 2", duration: "15d", phase: "installation", startPct: 77, widthPct: 3.2 },
  { id: "level-3", label: "Level 3", duration: "15d", phase: "installation", startPct: 79.2, widthPct: 3.2 },
  { id: "level-4", label: "Level 4", duration: "15d", phase: "installation", startPct: 81.4, widthPct: 3.2 },
  { id: "level-5", label: "Level 5", duration: "15d", phase: "installation", startPct: 83.6, widthPct: 3.2 },
  { id: "level-6", label: "Level 6", duration: "15d", phase: "installation", startPct: 85.8, widthPct: 3.2 },
  { id: "punch-list", label: "Punch List", duration: "15d", phase: "closeout", startPct: 89.3, widthPct: 3.2 },
];

const phaseColors: Record<SchedulePhase, string> = {
  procurement: "#0878e5",
  installation: "#d8102f",
  closeout: "#77797d",
};

export function InstallationGanttScene({ scene }: InstallationGanttSceneProps) {
  return (
    <section className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-[#f7f7f5] px-4 pb-16 pt-20 text-[#101114] sm:px-8 sm:pb-20 sm:pt-24 lg:px-12">
      <header className="grid shrink-0 gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase text-[#b3192b]">{scene.eyebrow}</p>
          <h1 className="mt-3 text-[clamp(2.5rem,5.2vw,5.8rem)] font-semibold leading-[0.92] tracking-normal">
            Installation Schedule
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-black/64 sm:text-xs">
          {(Object.keys(phaseColors) as SchedulePhase[]).map((phase) => (
            <span key={phase} className="inline-flex items-center gap-2 capitalize">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: phaseColors[phase] }} />
              {phase}
            </span>
          ))}
        </div>
      </header>

      <div className="mt-5 min-h-0 flex-1 overflow-auto border-y border-black/10 bg-white lg:mt-7" role="region" aria-label="Magnolia Landing installation schedule">
        <div className="min-w-[1040px]" role="table" aria-label="Installation schedule by quarter">
          <div className="sticky top-0 z-20 grid grid-cols-[250px_minmax(790px,1fr)] border-b border-black/10 bg-white" role="row">
            <div className="sticky left-0 z-30 flex items-end bg-white px-4 pb-3 font-mono text-[9px] uppercase text-black/42" role="columnheader">
              Workstream
            </div>
            <div className="grid grid-cols-7" role="columnheader">
              {quarters.map((quarter) => (
                <div key={quarter} className="border-l border-black/12 px-2 pb-3 text-center text-sm font-medium text-black/58">
                  {quarter}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-[250px] right-0 grid grid-cols-7" aria-hidden="true">
              {quarters.map((quarter) => (
                <span key={quarter} className="border-l border-black/12" />
              ))}
            </div>

            {scheduleRows.map((row, index) => {
              const style: BarStyle = {
                "--bar-left": `${row.startPct}%`,
                "--bar-width": `${row.widthPct}%`,
                "--bar-delay": `${120 + index * 70}ms`,
              };
              return (
                <div
                  key={row.id}
                  className={`grid h-[46px] grid-cols-[250px_minmax(790px,1fr)] border-b border-black/[0.055] last:border-b-0 ${index % 2 ? "bg-[#f2f2f2]" : "bg-white"}`}
                  role="row"
                >
                  <div className={`sticky left-0 z-10 flex items-center px-4 text-sm font-medium ${index % 2 ? "bg-[#f2f2f2]" : "bg-white"}`} role="rowheader">
                    {row.label}
                  </div>
                  <div className="relative" role="cell">
                    <div className="gantt-scene-bar absolute top-1/2 h-[18px] -translate-y-1/2" style={style}>
                      <span className="block h-full w-full rounded-[2px]" style={{ backgroundColor: phaseColors[row.phase] }} />
                      <span className="absolute left-[calc(100%+10px)] top-1/2 flex -translate-y-1/2 whitespace-nowrap text-xs font-medium text-black/58">
                        {row.duration}{row.owner ? ` · ${row.owner}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="mt-3 hidden shrink-0 gap-2 text-xs text-black/54 sm:flex sm:items-center sm:justify-between">
        <p>Levels 1–6 include layout, clip install, and unit install with just-in-time, floor-by-floor delivery.</p>
        <p className="font-mono text-[9px] uppercase text-black/42">Level 1 · 25 days / Levels 2–6 · 15 days each</p>
      </footer>

      <style jsx>{`
        .gantt-scene-bar {
          left: var(--bar-left);
          width: var(--bar-width);
          min-width: 10px;
          transform-origin: left center;
          animation: gantt-bar-in 520ms cubic-bezier(0.22, 1, 0.36, 1) var(--bar-delay) both;
        }
        @keyframes gantt-bar-in {
          from {
            opacity: 0;
            transform: translateY(-50%) scaleX(0);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) scaleX(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .gantt-scene-bar {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
