"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  LocateFixed,
  MapPinned,
  Pause,
  Play,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type RefObject,
} from "react";
import {
  ProjectMapCore,
  type MappableProject,
  type ProjectMapCoreHandle,
} from "@/components/maps/project-map-core";
import { FloorSequenceStage } from "@/components/pursuits/floor-sequence-stage";
import { HotspotLayer } from "@/components/pursuits/hotspot-layer";
import { InstallationGanttScene } from "@/components/pursuits/installation-gantt-scene";
import { TechnicalSceneStage } from "@/components/pursuits/technical-scene-stage";
import { magnoliaVendorProducts } from "@/data/vendors";
import type {
  Hotspot,
  PresentationAppearance,
  PursuitScene,
  ReferenceProject,
} from "@/data/pursuits/types";

type SceneRendererProps = {
  scene: PursuitScene;
  sceneIndex: number;
  appearance: PresentationAppearance;
  videoRef: RefObject<HTMLVideoElement | null>;
  isMuted: boolean;
  hideNarrative: boolean;
  hotspots: Hotspot[];
  activeHotspotId: string | null;
  selectedReferenceId: string | null;
  onSelectHotspot: (id: string) => void;
  onSelectReference: (id: string) => void;
  onVideoEnded: () => void;
  interactionPaused: boolean;
};

type NarrativeSceneProps = Pick<
  SceneRendererProps,
  "scene" | "sceneIndex" | "appearance" | "videoRef" | "isMuted" | "hideNarrative" | "onVideoEnded"
> & {
  variant: "hero" | "scope" | "finish" | "sequence" | "proof";
};

function StageMedia({
  scene,
  sceneIndex,
  videoRef,
  isMuted,
  onVideoEnded,
}: Pick<
  NarrativeSceneProps,
  "scene" | "sceneIndex" | "videoRef" | "isMuted" | "onVideoEnded"
>) {
  if (scene.video) {
    return (
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
    );
  }

  return (
    <Image
      key={scene.image}
      src={scene.image}
      alt=""
      fill
      priority={sceneIndex < 2}
      sizes="100vw"
      className="magnolia-scene-image object-cover"
    />
  );
}

function SceneEyebrow({ children }: { children: string }) {
  return <p className="font-mono text-[10px] uppercase opacity-58 sm:text-xs">{children}</p>;
}

function DisplayTitle({ children }: { children: string }) {
  return (
    <h1 className="mt-3 max-w-6xl text-balance text-[clamp(3rem,7vw,8.5rem)] font-semibold leading-[0.9] tracking-normal">
      {children}
    </h1>
  );
}

function MetricRow({ scene }: { scene: PursuitScene }) {
  return (
    <div className="mt-5 grid max-w-3xl grid-cols-3 border-y border-current/16">
      {scene.metrics.map((metric) => (
        <div key={`${metric.label}-${metric.value}`} className="min-w-0 border-r border-current/16 px-2 py-3 first:pl-0 last:border-r-0 sm:px-4 sm:py-4">
          <p className="font-mono text-[8px] uppercase opacity-48 sm:text-[10px]">{metric.label}</p>
          <p className="mt-1 text-[11px] font-semibold leading-4 sm:mt-2 sm:text-sm">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

function ContextPanel({ scene }: { scene: PursuitScene }) {
  if (!scene.context) return null;
  return (
    <aside className="hidden border-l border-current/18 pl-7 lg:block">
      <p className="font-mono text-[10px] uppercase opacity-48">{scene.context.eyebrow}</p>
      <h2 className="mt-4 text-2xl font-semibold leading-7">{scene.context.title}</h2>
      <ul className="mt-6 space-y-3 border-t border-current/16 pt-5 text-sm leading-6 opacity-72">
        {scene.context.facts.map((fact) => (
          <li key={fact} className="grid grid-cols-[8px_1fr] gap-3">
            <span className="mt-[9px] size-1.5 bg-current" aria-hidden="true" />
            <span>{fact}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function NarrativeScene({
  scene,
  sceneIndex,
  appearance,
  videoRef,
  isMuted,
  hideNarrative,
  onVideoEnded,
  variant,
}: NarrativeSceneProps) {
  const isLight = appearance === "light";
  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <StageMedia
          scene={scene}
          sceneIndex={sceneIndex}
          videoRef={videoRef}
          isMuted={isMuted}
          onVideoEnded={onVideoEnded}
        />
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            hideNarrative
              ? "bg-black/8"
              : isLight
                ? "bg-[linear-gradient(90deg,rgba(248,248,245,0.96),rgba(248,248,245,0.70)_48%,rgba(248,248,245,0.26)),linear-gradient(0deg,rgba(248,248,245,0.92),transparent_62%)]"
                : "bg-[linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.48)_48%,rgba(0,0,0,0.14)),linear-gradient(0deg,rgba(0,0,0,0.9),transparent_62%)]"
          }`}
        />
      </div>

      <section
        aria-hidden={hideNarrative}
        className={`magnolia-scene relative z-20 mt-auto grid min-h-0 gap-6 px-5 pb-20 transition-all duration-500 sm:px-8 sm:pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.48fr)] lg:items-end lg:gap-10 lg:px-12 ${
          hideNarrative ? "pointer-events-none translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        } ${isLight ? "text-[#090b0f]" : "text-white"}`}
        data-scene-template={variant}
      >
        <div className="min-w-0">
          <SceneEyebrow>{scene.eyebrow}</SceneEyebrow>
          <DisplayTitle>{scene.title}</DisplayTitle>
          <p className="mt-4 max-w-3xl text-sm leading-6 opacity-72 sm:text-base sm:leading-7 lg:text-lg">{scene.lead}</p>
          <MetricRow scene={scene} />
        </div>
        <ContextPanel scene={scene} />
      </section>
    </>
  );
}

export function HeroScene(props: Omit<NarrativeSceneProps, "variant">) {
  return <NarrativeScene {...props} variant="hero" />;
}

export function ScopeScene(props: Omit<NarrativeSceneProps, "variant">) {
  return <NarrativeScene {...props} variant="scope" />;
}

export function FinishScene(props: Omit<NarrativeSceneProps, "variant">) {
  return <NarrativeScene {...props} variant="finish" />;
}

export function ProofScene(props: Omit<NarrativeSceneProps, "variant">) {
  return <NarrativeScene {...props} variant="proof" />;
}

export function SequenceScene(props: Omit<NarrativeSceneProps, "variant">) {
  if (props.scene.floorSequence?.length) return <FloorSequenceStage scene={props.scene} />;
  return <NarrativeScene {...props} variant="sequence" />;
}

export function EvidenceScene({ scene, appearance }: Pick<SceneRendererProps, "scene" | "appearance">) {
  return <TechnicalSceneStage scene={scene} appearance={appearance} />;
}

export function HotspotScene({
  scene,
  appearance,
  hotspots,
  activeHotspotId,
  onSelectHotspot,
}: Pick<
  SceneRendererProps,
  "scene" | "appearance" | "hotspots" | "activeHotspotId" | "onSelectHotspot"
>) {
  const active = hotspots.find((item) => item.id === activeHotspotId) ?? hotspots[0];
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setParallax({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 10,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 7,
    });
  };
  const isLight = appearance === "light";

  return (
    <section className={`absolute inset-0 overflow-hidden ${isLight ? "bg-[#f2f2ef] text-black" : "bg-black text-white"}`} onPointerMove={onPointerMove} onPointerLeave={() => setParallax({ x: 0, y: 0 })}>
      <div
        className="absolute inset-[-2%] transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(${active?.focusScale ?? 1.03})`,
          transformOrigin: active ? `${active.xPct}% ${active.yPct}%` : "50% 50%",
        }}
      >
        <Image src={scene.image} alt="Magnolia Landing exterior envelope" fill priority sizes="100vw" className="object-cover" />
        <div className={`absolute inset-0 ${isLight ? "bg-white/28" : "bg-[linear-gradient(90deg,rgba(0,0,0,.7),transparent_55%),linear-gradient(0deg,rgba(0,0,0,.74),transparent_68%)]"}`} />
        <HotspotLayer hotspots={hotspots} activeId={active?.id} onOpen={(hotspot) => onSelectHotspot(hotspot.id)} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 grid gap-5 p-5 pb-20 sm:p-8 sm:pb-24 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end lg:p-12 lg:pb-28">
        <div>
          <SceneEyebrow>{scene.eyebrow}</SceneEyebrow>
          <h1 className="mt-3 max-w-4xl text-balance text-[clamp(3rem,6.5vw,7.5rem)] font-semibold leading-[0.9] tracking-normal">{scene.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 opacity-72 sm:text-base">{scene.lead}</p>
        </div>
        <aside className={`hidden border p-5 backdrop-blur-xl lg:block ${isLight ? "border-black/12 bg-white/88" : "border-white/14 bg-black/64"}`}>
          <p className="font-mono text-[10px] uppercase opacity-48">{active?.label ?? scene.context?.eyebrow}</p>
          <h2 className="mt-3 text-xl font-semibold leading-6">{active?.summary ?? scene.context?.title}</h2>
          {active?.metrics?.length ? (
            <dl className="mt-5 grid grid-cols-3 gap-px border-y border-current/16 py-3">
              {active.metrics.map((metric) => (
                <div key={metric.label} className="px-2 first:pl-0">
                  <dt className="font-mono text-[8px] uppercase opacity-46">{metric.label}</dt>
                  <dd className="mt-1 text-xs font-semibold">{metric.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function referenceMapLocations(projects: ReferenceProject[]): MappableProject[] {
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    longitude: project.longitude,
    latitude: project.latitude,
    kind: "project",
    status: project.status,
  }));
}

const subscribeReducedMotion = (callback: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};

const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const subscribeVisibility = (callback: () => void) => {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
};

const getDocumentHidden = () => document.visibilityState === "hidden";

function ProjectStatus({ status }: { status: ReferenceProject["status"] }) {
  return (
    <span
      className={`inline-flex h-6 items-center border px-2 font-mono text-[9px] uppercase ${
        status === "pending"
          ? "border-[#ec1c24] bg-[#ec1c24] text-white"
          : "border-current/18 text-current/58"
      }`}
    >
      {status}
    </span>
  );
}

function ReferenceDetails({
  project,
  compact = false,
}: {
  project: ReferenceProject;
  compact?: boolean;
}) {
  const products = magnoliaVendorProducts.filter((product) =>
    project.productIds?.includes(product.id),
  );

  return (
    <article key={project.id} className="reference-project-detail">
      <div className={`grid gap-4 ${compact ? "grid-cols-[112px_1fr]" : "grid-cols-[148px_1fr]"}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-current/5">
          <Image
            src={project.image}
            alt={`${project.name} project`}
            fill
            sizes={compact ? "112px" : "148px"}
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatus status={project.status} />
            <span className="font-mono text-[9px] uppercase opacity-48">
              {project.market}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold leading-[1.02]">
            {project.name}
          </h2>
          <p className="mt-2 text-xs leading-5 opacity-58">{project.address}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 opacity-70">{project.description}</p>
      <div className="mt-4 border-t border-current/12 pt-4">
        <p className="font-mono text-[9px] uppercase opacity-46">1CG scope</p>
        <p className="mt-2 text-xs leading-5 opacity-72">{project.scope}</p>
      </div>

      {products.length ? (
        <div className="mt-4 border-t border-current/12 pt-4">
          <p className="font-mono text-[9px] uppercase opacity-46">
            Magnolia systems
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {products.map((product) => (
              <span
                key={product.id}
                className="border border-current/14 px-2 py-1 text-[10px] font-medium"
              >
                {product.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <dl className="mt-4 grid grid-cols-3 border-y border-current/12 py-3">
        {project.metrics.map((metric) => (
          <div key={metric.label} className="min-w-0 border-r border-current/12 px-2 first:pl-0 last:border-r-0">
            <dt className="font-mono text-[8px] uppercase opacity-46">{metric.label}</dt>
            <dd className="mt-1 truncate text-[11px] font-semibold">{metric.value}</dd>
          </div>
        ))}
      </dl>

      {project.href ? (
        <Link
          href={project.href}
          target="_blank"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold"
        >
          Open project <ArrowUpRight size={14} />
        </Link>
      ) : null}
    </article>
  );
}

export function ReferenceScene({
  scene,
  appearance,
  selectedReferenceId,
  onSelectReference,
  interactionPaused,
}: Pick<SceneRendererProps, "scene" | "appearance" | "selectedReferenceId" | "onSelectReference" | "interactionPaused">) {
  const projects = useMemo(() => scene.referenceProjects ?? [], [scene.referenceProjects]);
  const mapRef = useRef<ProjectMapCoreHandle | null>(null);
  const manualPauseTimerRef = useRef<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [manualPaused, setManualPaused] = useState(false);
  const [mapInteracting, setMapInteracting] = useState(false);
  const [railInteracting, setRailInteracting] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const documentHidden = useSyncExternalStore(
    subscribeVisibility,
    getDocumentHidden,
    () => false,
  );
  const selected = projects.find((project) => project.id === selectedReferenceId) ?? projects[0];
  const locations = useMemo(() => referenceMapLocations(projects), [projects]);

  const pauseAfterManualSelection = useCallback(() => {
    if (manualPauseTimerRef.current) window.clearTimeout(manualPauseTimerRef.current);
    setManualPaused(true);
    manualPauseTimerRef.current = window.setTimeout(() => {
      setManualPaused(false);
      manualPauseTimerRef.current = null;
    }, 10_000);
  }, []);

  const selectProject = useCallback((id: string, manual = true) => {
    onSelectReference(id);
    if (manual) pauseAfterManualSelection();
  }, [onSelectReference, pauseAfterManualSelection]);

  useEffect(
    () => () => {
      if (manualPauseTimerRef.current) window.clearTimeout(manualPauseTimerRef.current);
    },
    [],
  );

  const effectiveAutoplay = autoplayEnabled && !reducedMotion;
  const autoplayBlocked =
    !effectiveAutoplay ||
    interactionPaused ||
    documentHidden ||
    manualPaused ||
    mapInteracting ||
    railInteracting ||
    Boolean(hoveredId) ||
    mobileExpanded;

  useEffect(() => {
    if (autoplayBlocked || projects.length < 2 || !selected) return;
    const timeout = window.setTimeout(() => {
      const currentIndex = projects.findIndex((project) => project.id === selected.id);
      const next = projects[(currentIndex + 1) % projects.length];
      if (next) selectProject(next.id, false);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [autoplayBlocked, projects, selectProject, selected]);

  const overview = () => {
    pauseAfterManualSelection();
    mapRef.current?.fitPreset("charleston");
  };

  if (!selected) return null;

  const surface = appearance === "dark" ? "border-white/14 bg-[#090b0f] text-white" : "border-black/12 bg-white text-black";

  return (
    <section className={`absolute inset-0 grid min-h-0 overflow-hidden pt-16 lg:grid-cols-[minmax(0,1fr)_460px] ${appearance === "dark" ? "bg-[#090b0f] text-white" : "bg-white text-black"}`}>
      <div className="relative min-h-0">
        <ProjectMapCore
          ref={mapRef}
          locations={locations}
          selectedId={selected.id}
          highlightedId={hoveredId}
          onSelect={(id) => selectProject(id)}
          onHighlight={setHoveredId}
          cameraPreset="charleston"
          appearance={appearance}
          mode="presentation"
          showBuildings
          showControls
          reducedMotion={reducedMotion}
          onInteractionStart={() => setMapInteracting(true)}
          onInteractionEnd={() => setMapInteracting(false)}
        />
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
          <button type="button" onClick={() => setAutoplayEnabled((value) => !value)} className={`grid size-10 place-items-center border ${surface}`} aria-label={effectiveAutoplay ? "Pause project tour" : "Play project tour"}>
            {effectiveAutoplay ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button type="button" onClick={overview} className={`inline-flex h-10 items-center gap-2 border px-3 text-xs font-medium ${surface}`}>
            <LocateFixed size={15} /> Charleston overview
          </button>
          <span className={`hidden h-10 items-center border px-3 font-mono text-[9px] uppercase sm:inline-flex ${surface}`}>
            {autoplayBlocked ? "Tour paused" : `Touring ${projects.length} locations`}
          </span>
        </div>

        <div className={`absolute inset-x-0 bottom-16 z-20 border-t lg:hidden ${surface} ${mobileExpanded ? "top-0" : "max-h-[292px]"}`}>
          <div className="flex items-center justify-between border-b border-current/12 px-4 py-3">
            <div>
              <p className="font-mono text-[9px] uppercase opacity-48">Charleston project</p>
              <p className="mt-1 text-sm font-semibold">{selected.name}</p>
            </div>
            <button type="button" onClick={() => setMobileExpanded((value) => !value)} className="grid size-10 place-items-center border border-current/14" aria-label={mobileExpanded ? "Collapse project details" : "Expand project details"}>
              {mobileExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
          {mobileExpanded ? (
            <div className="h-[calc(100%-65px)] overflow-y-auto p-4">
              <ReferenceDetails project={selected} compact />
            </div>
          ) : (
            <div
              className="flex gap-2 overflow-x-auto p-3"
              onPointerEnter={() => setRailInteracting(true)}
              onPointerLeave={() => setRailInteracting(false)}
              onFocusCapture={() => setRailInteracting(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setRailInteracting(false);
              }}
            >
              {projects.map((project) => (
                <button key={project.id} type="button" onClick={() => { selectProject(project.id); setMobileExpanded(true); }} className={`grid w-52 shrink-0 grid-cols-[72px_1fr] gap-3 border p-2 text-left ${project.id === selected.id ? "border-[#ec1c24]" : "border-current/14"}`}>
                  <span className="relative aspect-[4/3] overflow-hidden bg-current/5"><Image src={project.image} alt="" fill sizes="72px" className="object-cover" /></span>
                  <span className="min-w-0"><strong className="block truncate text-xs">{project.name}</strong><span className="mt-1 block text-[10px] opacity-58">{project.market}</span><span className="mt-2 block font-mono text-[8px] uppercase opacity-46">{project.status}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className={`hidden min-h-0 flex-col border-l lg:flex ${surface}`} onPointerEnter={() => setRailInteracting(true)} onPointerLeave={() => setRailInteracting(false)} onFocusCapture={() => setRailInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setRailInteracting(false); }}>
        <header className="border-b border-current/12 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <SceneEyebrow>{scene.eyebrow}</SceneEyebrow>
              <h1 className="mt-2 text-3xl font-semibold leading-none tracking-normal">{scene.title}</h1>
            </div>
            <MapPinned size={20} className="opacity-42" />
          </div>
        </header>
        <div className="border-b border-current/12 p-5">
          <ReferenceDetails project={selected} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto" aria-label="Charleston projects">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(project.id)}
              onBlur={() => setHoveredId(null)}
              onClick={() => selectProject(project.id)}
              className={`grid w-full grid-cols-[84px_1fr] gap-3 border-b border-current/12 p-3 text-left transition-colors ${project.id === selected.id ? "bg-[#ec1c24]/8" : "hover:bg-current/5"}`}
            >
              <span className="relative aspect-[4/3] overflow-hidden bg-current/5"><Image src={project.image} alt="" fill sizes="84px" className="object-cover" /></span>
              <span className="min-w-0"><span className="flex items-center gap-2"><strong className="block truncate text-sm">{project.name}</strong>{project.status === "pending" ? <span className="size-1.5 shrink-0 bg-[#ec1c24]" /> : null}</span><span className="mt-1 block text-[11px] opacity-54">{project.market} · {project.location}</span><span className="mt-2 line-clamp-2 block text-[10px] leading-4 opacity-64">{project.description}</span></span>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}

export function SceneRenderer(props: SceneRendererProps) {
  const common = {
    scene: props.scene,
    sceneIndex: props.sceneIndex,
    appearance: props.appearance,
    videoRef: props.videoRef,
    isMuted: props.isMuted,
    hideNarrative: props.hideNarrative,
    onVideoEnded: props.onVideoEnded,
  };

  switch (props.scene.type) {
    case "hero": return <HeroScene {...common} />;
    case "scope": return <ScopeScene {...common} />;
    case "hotspot": return <HotspotScene scene={props.scene} appearance={props.appearance} hotspots={props.hotspots} activeHotspotId={props.activeHotspotId} onSelectHotspot={props.onSelectHotspot} />;
    case "evidence": return <EvidenceScene scene={props.scene} appearance={props.appearance} />;
    case "finish": return <FinishScene {...common} />;
    case "gantt": return <InstallationGanttScene scene={props.scene} />;
    case "sequence": return <SequenceScene {...common} />;
    case "proof": return <ProofScene {...common} />;
    case "reference": return <ReferenceScene scene={props.scene} appearance={props.appearance} selectedReferenceId={props.selectedReferenceId} onSelectReference={props.onSelectReference} interactionPaused={props.interactionPaused} />;
    default: {
      const exhaustive: never = props.scene.type;
      return exhaustive;
    }
  }
}
