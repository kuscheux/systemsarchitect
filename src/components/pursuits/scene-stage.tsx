import Image from "next/image";
import type { RefObject } from "react";
import type { Hotspot, PursuitScene } from "@/data/pursuits/types";
import { HotspotLayer } from "@/components/pursuits/hotspot-layer";
import { TechnicalSceneStage } from "@/components/pursuits/technical-scene-stage";
import { FloorSequenceStage } from "@/components/pursuits/floor-sequence-stage";

type SceneStageProps = {
  scene: PursuitScene;
  sceneIndex: number;
  videoRef: RefObject<HTMLVideoElement | null>;
  isMuted: boolean;
  hideNarrative: boolean;
  hotspots: Hotspot[];
  onHotspotOpen: (hotspot: Hotspot) => void;
  onVideoEnded: () => void;
};

export function SceneStage({
  scene,
  sceneIndex,
  videoRef,
  isMuted,
  hideNarrative,
  hotspots,
  onHotspotOpen,
  onVideoEnded,
}: SceneStageProps) {
  if (scene.floorSequence?.length) {
    return <FloorSequenceStage scene={scene} />;
  }

  if (scene.technicalDetails?.length) {
    return <TechnicalSceneStage scene={scene} />;
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        {scene.video ? (
          <video
            ref={videoRef}
            key={scene.video}
            className="h-full w-full object-cover"
            src={scene.video}
            poster={scene.image}
            muted={isMuted}
            playsInline
            preload={sceneIndex === 0 ? "auto" : "metadata"}
            onEnded={onVideoEnded}
          />
        ) : (
          <Image
            key={scene.image}
            src={scene.image}
            alt=""
            fill
            priority={sceneIndex < 2}
            sizes="100vw"
            className="magnolia-scene-image object-cover"
          />
        )}
        <div
          className={`absolute inset-0 transition-all duration-700 ${
            hideNarrative
              ? "bg-black/10"
              : "bg-[linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.48)_48%,rgba(0,0,0,0.16)),linear-gradient(0deg,rgba(0,0,0,0.9),transparent_62%)]"
          }`}
        />
      </div>

      {!hideNarrative && hotspots.length ? (
        <HotspotLayer hotspots={hotspots} onOpen={onHotspotOpen} />
      ) : null}

      <section
        key={scene.id}
        aria-hidden={hideNarrative}
        className={`magnolia-scene relative z-20 mt-auto grid min-h-0 gap-6 px-5 pb-3 transition-all duration-500 sm:px-8 sm:pb-5 lg:items-end lg:gap-10 lg:px-12 ${
          hideNarrative
            ? "pointer-events-none translate-y-3 opacity-0"
            : "translate-y-0 opacity-100"
        } lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.48fr)]`}
      >
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase text-white/58 sm:text-xs">
            {scene.eyebrow}
          </p>
          <h1
            className="mt-3 max-w-6xl text-balance text-[clamp(3.35rem,7.1vw,8.75rem)] font-semibold leading-[0.9] tracking-normal"
          >
            {scene.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/72 sm:text-base sm:leading-7 lg:text-lg">
            {scene.body}
          </p>
          <div className="mt-5 grid max-w-3xl grid-cols-3 border-y border-white/16">
            {scene.metrics.map((metric) => (
              <div
                key={metric.label}
                className="min-w-0 border-r border-white/16 px-2 py-3 first:pl-0 last:border-r-0 sm:px-4 sm:py-4"
              >
                <p className="font-mono text-[8px] uppercase text-white/42 sm:text-[10px]">
                  {metric.label}
                </p>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-white sm:mt-2 sm:text-sm">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside
          className="hidden border-l border-white/18 pl-7 lg:block"
          aria-label="Current project record"
        >
          <p className="font-mono text-[10px] uppercase text-white/42">
            Connected project record
          </p>
          <p className="mt-4 text-xl font-medium leading-7 text-white">
            {scene.presenterNote.lead}
          </p>
          <ul className="mt-6 space-y-3 border-t border-white/16 pt-5 text-sm leading-6 text-white/66">
            {scene.presenterNote.talkingPoints.map((point) => (
              <li key={point} className="grid grid-cols-[8px_1fr] gap-3">
                <span className="mt-[9px] size-1.5 bg-white/70" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </>
  );
}
