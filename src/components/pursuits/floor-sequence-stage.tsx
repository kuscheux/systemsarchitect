"use client";

import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { useState, type CSSProperties } from "react";
import type { PursuitScene } from "@/data/pursuits/types";

type FloorSequenceStageProps = {
  scene: PursuitScene;
};

type SequenceStyle = CSSProperties & {
  "--sequence-delay": string;
  "--sequence-bottom": string;
};

export function FloorSequenceStage({ scene }: FloorSequenceStageProps) {
  const [run, setRun] = useState(0);
  const steps = scene.floorSequence ?? [];

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <Image src={scene.image} alt="Magnolia Landing exterior rendering" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.38)_48%,rgba(0,0,0,0.12)),linear-gradient(0deg,rgba(0,0,0,0.82),transparent_68%)]" />
      </div>

      <section className="relative z-20 grid h-full min-h-0 grid-cols-1 gap-7 px-5 pb-20 pt-20 sm:px-8 lg:grid-cols-[minmax(300px,0.68fr)_minmax(0,1.32fr)] lg:items-end lg:px-12 lg:pb-24 lg:pt-24">
        <div className="self-end">
          <p className="font-mono text-[10px] uppercase text-white/56">{scene.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-balance text-[clamp(3rem,6.2vw,7.4rem)] font-semibold leading-[0.9] tracking-normal text-white">
            {scene.title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-white/70 lg:text-base lg:leading-7">{scene.lead}</p>
          <div className="mt-6 grid max-w-2xl grid-cols-3 border-y border-white/18">
            {scene.metrics.map((metric) => (
              <div key={metric.label} className="border-r border-white/18 px-3 py-3 first:pl-0 last:border-r-0">
                <p className="font-mono text-[8px] uppercase text-white/42">{metric.label}</p>
                <p className="mt-1 text-xs font-semibold text-white sm:text-sm">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div key={run} className="relative hidden h-[min(68vh,680px)] min-h-[420px] lg:block" aria-label="Six-floor installation sequence">
          <div className="absolute inset-y-[5%] left-[16%] w-px bg-white/24" />
          {steps.map((step, index) => {
            const style: SequenceStyle = {
              "--sequence-delay": `${0.25 + index * 0.62}s`,
              "--sequence-bottom": `${8 + index * 14}%`,
            };
            return (
              <div key={step.floor} className="floor-sequence-step absolute inset-x-0" style={style}>
                <div className="absolute bottom-0 left-[16%] right-[18%] h-full min-h-12 origin-bottom border border-white/46 bg-white/16 backdrop-blur-[2px]" />
                <div className="absolute bottom-0 left-[12%] right-[7%] flex items-center">
                  <span className="size-2.5 rounded-full border-2 border-black bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.2)]" />
                  <span className="h-px min-w-0 flex-1 bg-white/52" />
                  <span className="floor-sequence-callout min-w-32 border border-white/22 bg-black/82 px-3 py-2 text-white shadow-xl backdrop-blur-md">
                    <span className="block font-mono text-[8px] uppercase text-white/46">{step.floor}</span>
                    <span className="mt-0.5 block text-sm font-semibold">{step.duration}</span>
                  </span>
                </div>
              </div>
            );
          })}
          <div className="floor-sequence-total absolute bottom-[2%] right-[7%] border-t border-white/28 pt-3 text-right">
            <p className="font-mono text-[9px] uppercase text-white/48">Six-level field sequence</p>
            <p className="mt-1 text-2xl font-semibold text-white">100 days</p>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setRun((value) => value + 1)}
        className="absolute right-4 top-1/2 z-40 grid size-9 -translate-y-1/2 place-items-center border border-white/22 bg-black/52 text-white/76 backdrop-blur-md transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
        aria-label="Replay floor sequence"
        title="Replay floor sequence"
      >
        <RotateCcw size={15} />
      </button>

      <style jsx>{`
        .floor-sequence-step {
          bottom: var(--sequence-bottom);
          height: 13%;
          opacity: 0;
          transform: translateY(26px);
          animation: floor-rise 560ms cubic-bezier(0.22, 1, 0.36, 1) var(--sequence-delay) forwards;
        }
        .floor-sequence-callout {
          opacity: 0;
          transform: translateX(18px);
          animation: callout-in 380ms ease-out calc(var(--sequence-delay) + 240ms) forwards;
        }
        .floor-sequence-total {
          opacity: 0;
          animation: callout-in 420ms ease-out 4.25s forwards;
        }
        @keyframes floor-rise {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes callout-in {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .floor-sequence-step,
          .floor-sequence-callout,
          .floor-sequence-total {
            animation-duration: 1ms;
            animation-delay: 0ms;
          }
        }
      `}</style>
    </>
  );
}
