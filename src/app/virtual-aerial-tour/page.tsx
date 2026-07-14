"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ExternalLink, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";
import type { Project } from "@/data/projects";

const videoSrc = "/videos/charlotte-short-scrub.mp4";

type TourArticle = {
  title: string;
  source: string;
  href: string;
  summary: string;
  quote: string;
};

type TourStop = {
  id: string;
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  body: string;
  projectName?: string;
  project?: Project;
  articles?: TourArticle[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function projectByName(name: string) {
  return projects.find((project) => project.name === name);
}

const gallerySlots = ["Exterior", "Interior", "Detail", "Install / Progress"];

function ProjectThumbnailRail({
  project,
  onOpen,
  href,
  compact = false,
}: {
  project?: Project;
  onOpen?: () => void;
  href?: string;
  compact?: boolean;
}) {
  if (!project) return null;

  const thumbs = gallerySlots.slice(0, 3);
  const finalTile = (
    <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded border border-white/18 bg-black text-[9px] font-semibold text-white shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
      <Image
        src={project.image}
        alt={`${project.name} gallery`}
        fill
        sizes="36px"
        className="object-cover opacity-54"
      />
      <span className="absolute inset-0 bg-black/56" />
      <span className="relative z-10 text-center leading-none">
        +{gallerySlots.length}
        <span className="mt-0.5 block text-[7px] font-medium uppercase tracking-[0.08em] text-white/68">
          photos
        </span>
      </span>
    </span>
  );

  return (
    <div className={`${compact ? "" : "mt-5"} flex items-center gap-1`}>
      {thumbs.map((label, index) => (
        <span
          key={label}
          className="relative h-9 w-9 shrink-0 overflow-hidden rounded border border-white/18 bg-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
          title={label}
        >
          <Image
            src={project.image}
            alt={`${project.name} ${label}`}
            fill
            sizes="36px"
            className="object-cover"
            style={{ objectPosition: `${50 + (index - 1) * 12}% center` }}
          />
        </span>
      ))}
      {href ? (
        <Link href={href} target="_blank" rel="noreferrer" aria-label={`Open ${project.name} gallery`}>
          {finalTile}
        </Link>
      ) : (
        <button type="button" onClick={onOpen} aria-label={`Open ${project.name} gallery`}>
          {finalTile}
        </button>
      )}
    </div>
  );
}

const radiusArticles: TourArticle[] = [
  {
    title: "Dilworth's tallest building breaks ground",
    source: "Axios Charlotte",
    href: "https://www.axios.com/local/charlotte/2022/05/17/26-story-tower-with-skyline-views-breaks-ground-soon-in-dilworth-272624",
    summary:
      "Radius Dilworth is described as a two-building project with the 26-story Overlook tower and the eight-story Enclave tower.",
    quote: "A 26-story tower broke ground in Dilworth.",
  },
  {
    title: "Radius Dilworth project profile",
    source: "Charlotte Center City Partners",
    href: "https://www.charlottecentercity.org/project/radius-dilworth",
    summary:
      "Public project profile for the Overlook and Enclave residential buildings near Morehead Street.",
    quote: "Overlook and Enclave",
  },
  {
    title: "Radius Dilworth architecture profile",
    source: "BB+M Architecture",
    href: "https://www.bbm-arch.com/project/radius-dilworth/",
    summary:
      "Architecture profile for the paired residential program at the edge of Dilworth and South End.",
    quote: "Radius Dilworth",
  },
];

const railyardArticles: TourArticle[] = [
  {
    title: "Everything you need to know about The RailYard",
    source: "Beacon Partners",
    href: "https://beacondevelopment.com/news/everything-you-need-to-know-about-the-railyard-in-south-end",
    summary:
      "Beacon frames The RailYard around South End history, rail-inspired public space, and forward-looking office design.",
    quote: "Fusing history with innovation",
  },
  {
    title: "The RailYard landscape profile",
    source: "LandDesign",
    href: "https://landdesign.com/project/the-railyard/",
    summary:
      "LandDesign calls out Class A office, retail, dining, residential space, and the project's pedestrian-oriented environment.",
    quote: "A Bonafide, Urban Block Mixed-Use Development",
  },
  {
    title: "Rhino Market joins The RailYard",
    source: "CharlotteFive",
    href: "https://www.charlotteobserver.com/charlottefive/c5-worklife/article236111418.html",
    summary:
      "CharlotteFive covered The RailYard as a block-scale mixed-use development with creative office, retail, and micro-apartments.",
    quote: "light of entertainment at the end of the tunnel",
  },
];

const eastArticles: TourArticle[] = [
  {
    title: "110 East building profile",
    source: "110 East",
    href: "https://www.110east.com/",
    summary:
      "The official building profile positions 110 East as a 23-story, 370,000 SF Class A+ office tower at the East/West light rail station.",
    quote: "only Class A+ office tower with a stop on the light rail",
  },
  {
    title: "Coinbase leases 58,600 SF at 110 East",
    source: "REBusinessOnline",
    href: "https://rebusinessonline.com/coinbase-leases-58600-sf-at-110-east-office-tower-in-charlottes-south-end/",
    summary:
      "Coinbase leased floors 18 and 19 for a Charlotte Center of Excellence expected to house 130 employees.",
    quote: "Center of Excellence",
  },
  {
    title: "Coinbase to open Charlotte office",
    source: "Axios Charlotte",
    href: "https://www.axios.com/local/charlotte/2025/06/03/coinbase-110-east-south-end-crypto-jobs-fintech",
    summary:
      "Axios described the Coinbase deal as the largest lease yet at 110 East and a high-profile name for South End.",
    quote: "largest lease yet",
  },
];

const squareArticles: TourArticle[] = [
  {
    title: "Curtain Wall, Clear Vision",
    source: "FacilitiesNet",
    href: "https://www.facilitiesnet.com/commercialofficefacilities/tip/Curtain-Wall-Clear-Vision-The-Square-at-South-End-Blends-Modern-Design-with-Sustainable-Performance--55630",
    summary:
      "FacilitiesNet links the LEED Silver office tower, EFCO curtain wall systems, USAA occupancy, and 1st Choice Glass installation.",
    quote: "Curtain Wall, Clear Vision",
  },
  {
    title: "The Square at South End",
    source: "Guardian Glass",
    href: "https://www.guardianglass.com/eu/en/projects/project-details/The-Square-at-South-End",
    summary:
      "Guardian Glass lists 1st Choice Glass as glazier and describes ten stories of office, retail, and restaurant use.",
    quote: "Ten stories of office, retail and restaurants",
  },
  {
    title: "USAA to open 90,000 SF office",
    source: "REBusinessOnline",
    href: "https://rebusinessonline.com/usaa-to-open-90000-sf-office-in-charlottes-south-end/",
    summary:
      "USAA leased six floors of the 153,000-square-foot building for roughly 750 employees.",
    quote: "six floors of the 153,000-square-foot building",
  },
];

const campbellArticles: TourArticle[] = [
  {
    title: "The Campbell set to deliver elevated living",
    source: "PRNewswire",
    href: "https://www.prnewswire.com/news-releases/the-campbell-set-to-deliver-elevated-living-in-charlottes-south-end-302239646.html",
    summary:
      "The Campbell is described as a 12-story, 117-unit boutique multifamily community in South End beside Dilworth.",
    quote: "boutique scale, unimpeded city views",
  },
  {
    title: "The Campbell project site context",
    source: "PRNewswire",
    href: "https://www.prnewswire.com/news-releases/the-campbell-set-to-deliver-elevated-living-in-charlottes-south-end-302239646.html",
    summary:
      "The project sits on the historical Campbell's Greenhouses site and carries subtle botanical references into the finished design.",
    quote: "historical site of Campbell's Greenhouses",
  },
];

const tourStops: TourStop[] = [
  {
    id: "intro",
    start: 0.01,
    end: 0.07,
    eyebrow: "Charlotte project intelligence",
    title: "See the work before you meet us.",
    body: "A one-shot pass across Charlotte with project context timed to the skyline.",
  },
  {
    id: "radius-dilworth",
    start: 0.17,
    end: 0.2,
    eyebrow: "Dilworth / Residential",
    title: "Radius Dilworth",
    body: "Two-building residential development at the edge of Uptown and Dilworth, including a 26-story tower and an eight-story companion building.",
    articles: radiusArticles,
  },
  {
    id: "railyard",
    start: 0.3,
    end: 0.35,
    eyebrow: "South End / Mixed-use",
    title: "The Railyard",
    body: "Class A office, retail, restaurants, and micro-apartments in a South End mixed-use district built around rail history.",
    projectName: "The Railyard",
    project: projectByName("The Railyard"),
    articles: railyardArticles,
  },
  {
    id: "110-east",
    start: 0.45,
    end: 0.5,
    eyebrow: "South End / Office",
    title: "110 East",
    body: "Class A+ office tower near the LYNX light rail with retail and restaurant frontage.",
    projectName: "110 East",
    project: projectByName("110 East"),
    articles: eastArticles,
  },
  {
    id: "square-usaa",
    start: 0.51,
    end: 0.56,
    eyebrow: "South End / USAA workplace",
    title: "The Square at South End",
    body: "The USAA-linked South End office moment: a 10-story mixed-use building with curtain wall, storefront, retail, and public plaza presence.",
    projectName: "The Square at South End",
    project: projectByName("The Square at South End"),
    articles: squareArticles,
  },
  {
    id: "110-east-return",
    start: 0.75,
    end: 0.79,
    eyebrow: "South End / Coinbase",
    title: "110 East",
    body: "A second skyline pass for the same high-rise proof point: curtain wall, storefront, entrances, and tower-scale execution.",
    projectName: "110 East",
    project: projectByName("110 East"),
    articles: eastArticles,
  },
  {
    id: "campbell",
    start: 0.82,
    end: 0.87,
    eyebrow: "South End / Residential",
    title: "The Campbell",
    body: "Twelve-story residential project in South End with amenity-driven glazing, window wall, storefront, and entrances.",
    projectName: "The Campbell",
    project: projectByName("The Campbell"),
    articles: campbellArticles,
  },
];

export default function VirtualAerialTourPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const scrubUntilRef = useRef(0);
  const isScrubbingRef = useRef(false);
  const modalOpenRef = useRef(false);
  const activeStopIdRef = useRef<string | null>(null);
  const lastSeekAtRef = useRef(0);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<TourStop | null>(null);

  const activeStop =
    tourStops.find((stop) => stop.id === activeStopId) ?? null;

  const openStop = (stop: TourStop) => {
    modalOpenRef.current = true;
    videoRef.current?.pause();
    setSelectedStop(stop);
  };

  const closeStop = () => {
    modalOpenRef.current = false;
    setSelectedStop(null);
    videoRef.current?.play().catch(() => {
      // Muted autoplay should work; this covers browser interruptions.
    });
  };

  useEffect(() => {
    let raf: number | null = null;
    let lastStopCheckAt = 0;
    const wheelSensitivity = 0.00225;
    const seekInterval = 42;

    const updateActiveStop = (video: HTMLVideoElement, now: number) => {
      if (now - lastStopCheckAt < 80 || !video.duration) return;
      lastStopCheckAt = now;

      const progress = clamp(video.currentTime / video.duration, 0, 1);
      const active = tourStops.findLast((stop) => progress >= stop.start);
      const nextActiveId = active?.id ?? null;
      if (nextActiveId !== activeStopIdRef.current) {
        activeStopIdRef.current = nextActiveId;
        setActiveStopId(nextActiveId);
      }
    };

    const update = () => {
      const video = videoRef.current;

      if (video) {
        video.playbackRate = 1;

        if (video.duration) {
          const now = performance.now();
          const isScrubbing = now < scrubUntilRef.current;
          const distance = targetTimeRef.current - video.currentTime;

          if (modalOpenRef.current) {
            if (!video.paused) video.pause();
          } else if (isScrubbing) {
            isScrubbingRef.current = true;
            if (!video.paused) video.pause();

            if (
              Math.abs(distance) > 0.035 &&
              now - lastSeekAtRef.current > seekInterval &&
              !video.seeking
            ) {
              const step = Math.sign(distance) * Math.min(Math.abs(distance) * 0.38, 0.82);
              video.currentTime = clamp(video.currentTime + step, 0, video.duration - 0.05);
              lastSeekAtRef.current = now;
            }
          } else if (isScrubbingRef.current) {
            isScrubbingRef.current = false;
            targetTimeRef.current = video.currentTime;
            video.play().catch(() => {
              // Muted autoplay should work; this covers browser interruptions.
            });
          } else {
            targetTimeRef.current = video.currentTime;
            if (video.paused) {
              video.play().catch(() => {
                // Muted autoplay should work; this covers browser interruptions.
              });
            }
          }

          updateActiveStop(video, now);
        }
      }

      raf = requestAnimationFrame(update);
    };

    const handleWheel = (event: WheelEvent) => {
      const video = videoRef.current;
      if (modalOpenRef.current) return;
      if (!video?.duration) return;

      event.preventDefault();
      const modeMultiplier =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const normalizedDelta = event.deltaY * modeMultiplier;
      const deltaSeconds =
        Math.sign(normalizedDelta) * Math.min(Math.abs(normalizedDelta) * wheelSensitivity, 1.45);
      const baseTime = isScrubbingRef.current ? targetTimeRef.current : video.currentTime;

      targetTimeRef.current = clamp(
        baseTime + deltaSeconds,
        0,
        video.duration - 0.05,
      );
      scrubUntilRef.current = performance.now() + 420;
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        targetTimeRef.current = videoRef.current.currentTime;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && modalOpenRef.current) {
        closeStop();
      }
    };

    const video = videoRef.current;
    video?.addEventListener("loadedmetadata", handleLoadedMetadata);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    raf = requestAnimationFrame(update);
    return () => {
      video?.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0">
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-black/18" />
      </div>

      <div className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between px-5 py-5 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 text-sm font-medium text-black backdrop-blur-xl transition hover:bg-white"
        >
          <ArrowLeft size={15} />
          Back
        </Link>
        <Link
          href="/send-plans"
          className="inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/22"
        >
          Submit Plans <ArrowRight size={15} />
        </Link>
      </div>

      <aside
        className={`fixed right-5 top-24 z-10 w-[calc(100%-2.5rem)] max-w-xl rounded-[18px] border border-white/14 bg-black/36 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition duration-500 md:right-8 md:top-28 ${
          activeStop ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"
        }`}
      >
        {activeStop ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/56">
              {activeStop.eyebrow}
            </p>
            <h2 className="mt-3 text-5xl font-semibold leading-[0.88] tracking-[-0.075em]">
              {activeStop.title}
            </h2>
            {activeStop.articles?.[0] ? (
              <blockquote className="mt-4 border-l border-white/24 pl-4 text-2xl font-semibold leading-[0.98] tracking-[-0.065em] text-white">
                &ldquo;{activeStop.articles[0].quote}&rdquo;
              </blockquote>
            ) : null}
            <p className="mt-4 max-w-md text-sm leading-6 text-white/68">
              {activeStop.body}
            </p>
            {activeStop.project ? (
              <ProjectThumbnailRail
                project={activeStop.project}
                onOpen={() => openStop(activeStop)}
              />
            ) : null}
            {(activeStop.project || activeStop.articles?.length) ? (
              <button
                type="button"
                onClick={() => openStop(activeStop)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/88"
              >
                Project context <ArrowRight size={15} />
              </button>
            ) : null}
          </>
        ) : null}
      </aside>

      {selectedStop ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/56 px-4 py-8 backdrop-blur-lg">
          <section
            className={`relative max-h-[88vh] w-full overflow-hidden rounded-[20px] bg-[#f8f7f2] text-foreground shadow-[0_36px_120px_rgba(0,0,0,0.44)] ${
              selectedStop.project ? "max-w-5xl" : "max-w-2xl"
            }`}
          >
            <button
              type="button"
              onClick={closeStop}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/88 text-foreground shadow-[0_12px_32px_rgba(0,0,0,0.16)] transition hover:bg-white"
              aria-label="Close project window"
            >
              <X size={18} />
            </button>

            <div
              className={`grid max-h-[88vh] overflow-y-auto ${
                selectedStop.project ? "lg:grid-cols-[0.92fr_1.08fr]" : ""
              }`}
            >
              {selectedStop.project ? (
                <div className="relative min-h-[360px] bg-neutral-200 lg:min-h-[620px]">
                  <Image
                    src={selectedStop.project.image}
                    alt={selectedStop.project.name}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-black/22 p-1.5 backdrop-blur-xl">
                    <ProjectThumbnailRail
                      project={selectedStop.project}
                      href={`/projects/${selectedStop.project.slug}#gallery`}
                      compact
                    />
                  </div>
                </div>
              ) : null}

              <div className="p-6 md:p-8 lg:p-9">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  {selectedStop.eyebrow}
                </p>
                <h2 className="mt-3 text-5xl font-semibold leading-[0.88] tracking-[-0.075em] md:text-6xl">
                  {selectedStop.title}
                </h2>
                {selectedStop.articles?.[0] ? (
                  <blockquote className="mt-5 max-w-xl border-l border-foreground/18 pl-4 text-2xl font-semibold leading-[1.02] tracking-[-0.055em] text-foreground md:text-3xl">
                    &ldquo;{selectedStop.articles[0].quote}&rdquo;
                    <cite className="mt-3 block font-mono text-[10px] not-italic uppercase tracking-[0.14em] text-muted">
                      {selectedStop.articles[0].source}
                    </cite>
                  </blockquote>
                ) : null}
                <p className="mt-5 max-w-xl text-sm leading-6 text-muted">
                  {selectedStop.body}
                </p>

                {selectedStop.project ? (
                  <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 border-y border-border py-5 text-sm">
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        Market
                      </span>
                      <span className="mt-1 block font-medium">{selectedStop.project.market}</span>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        Location
                      </span>
                      <span className="mt-1 block font-medium">{selectedStop.project.location}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        1CG scope
                      </span>
                      <span className="mt-1 block font-medium">{selectedStop.project.scope}</span>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6">
                  {selectedStop.project ? (
                    <Link
                      href={`/projects/${selectedStop.project.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-80"
                    >
                      Open 1CG project page <ExternalLink size={15} />
                    </Link>
                  ) : null}
                </div>

                {selectedStop.articles?.length ? (
                  <div className="mt-7">
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      Published context
                    </div>
                    <div className="divide-y divide-border/80 border-y border-border/80">
                      {selectedStop.articles.slice(0, 2).map((article) => (
                        <Link
                          key={article.href}
                          href={article.href}
                          target="_blank"
                          rel="noreferrer"
                          className="group grid gap-2 py-3 transition hover:bg-white/42 md:grid-cols-[0.7fr_1.3fr]"
                        >
                          <span>
                            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                              {article.source}
                            </span>
                            <span className="mt-1 block text-sm font-semibold leading-tight tracking-[-0.035em] text-foreground">
                              &ldquo;{article.quote}&rdquo;
                            </span>
                          </span>
                          <span className="text-xs leading-5 text-muted">
                            <span className="flex items-start justify-between gap-3 font-medium text-foreground">
                              {article.title}
                              <ExternalLink
                                size={13}
                                className="mt-1 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              />
                            </span>
                            <span className="mt-1 block">
                              {article.summary}
                            </span>
                          </span>
                        </Link>
                      ))}
                      {selectedStop.articles.length > 2 ? (
                        <Link
                          href={selectedStop.articles[2].href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition hover:text-foreground"
                        >
                          +{selectedStop.articles.length - 2} more source
                          <ExternalLink size={13} />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
