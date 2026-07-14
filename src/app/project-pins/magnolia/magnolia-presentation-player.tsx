"use client";

import Image from "next/image";
import Link from "next/link";
import { blinds } from "motion-plus/curtains";
import { useCurtains } from "motion-plus/react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  LayoutGrid,
  Maximize2,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type DetailImage = {
  src: string;
  label: string;
};

type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  video?: string;
  stats: Array<{ label: string; value: string }>;
  details?: DetailImage[];
  durationMs?: number;
};

type DeckSlide = {
  title: string;
  thumbnail: string;
  full: string;
};

const deckSlideTitles = [
  "Magnolia Landing",
  "Brand anthem",
  "Stronger Together",
  "Factory to field",
  "Project overview",
  "Installation schedule",
  "Architectural cladding",
  "6-inch V-Plank woodgrain",
  "Mosaic colors and finishes",
  "Charleston Green ACM",
  "Garage screening",
  "Architectural glazing",
  "GW-7000",
  "Commercial entrance systems",
  "Curtain wall systems",
  "GW-7000 bullnose detail",
  "Lower-iron glass",
  "EMR ratings",
  "Contact 1CG",
  "Waterfront Hotel",
  "22 WestEdge",
  "Morrison Yard",
] as const;

const deckSlides: DeckSlide[] = deckSlideTitles.map((title, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    title,
    thumbnail: `/images/magnolia/deck/original/slide-${number}.jpg`,
    full: `/images/magnolia/deck/full/slide-${number}.jpg`,
  };
});

const slides: Slide[] = [
  {
    eyebrow: "Magnolia Landing / Charleston, South Carolina",
    title: "One coordinated envelope.",
    body: "Glazing, cladding, screening, entrances, and installation presented as one clear delivery story.",
    image: "/images/magnolia/01-southeast-oblique.png",
    video: "/videos/brand/1cg-brand-anthem.mp4",
    durationMs: 216000,
    stats: [
      { label: "Status", value: "Design Assist" },
      { label: "Package", value: "Exterior Envelope" },
      { label: "Presented By", value: "1CG" },
    ],
  },
  {
    eyebrow: "01 / Current Conditions",
    title: "A live pursuit, already pinned.",
    body: "The Project Pin keeps the location, current site, team, scope, and stakeholder presentation together from pursuit through completion.",
    image: "/images/magnolia/03-west-elevation.png",
    stats: [
      { label: "Address", value: "115 Bachman Boulevard" },
      { label: "Owner", value: "Highland Resources" },
      { label: "AOR", value: "Cooper Carry" },
    ],
    details: [
      { src: "/images/magnolia/deck/page-05.webp", label: "Current site" },
    ],
  },
  {
    eyebrow: "02 / Installation Schedule",
    title: "The schedule is the strategy.",
    body: "Design assist, procurement, approvals, and floor-by-floor installation are coordinated before work reaches the field.",
    image: "/images/magnolia/05-south-elevation.png",
    stats: [
      { label: "Design Assist", value: "82 Days" },
      { label: "Material Procurement", value: "123 Days" },
      { label: "Field Sequence", value: "Levels 1-6" },
    ],
    details: [
      { src: "/images/magnolia/deck/page-06.webp", label: "Installation schedule" },
    ],
  },
  {
    eyebrow: "03 / Division 7",
    title: "One cladding package.",
    body: "ACM, wood-grain soffits, and custom garage screening move through a single fabrication and field-installation plan.",
    image: "/images/magnolia/02-east-elevation.png",
    stats: [
      { label: "Garage Screening", value: "About 12,000 SF" },
      { label: "Cladding + Soffit", value: "About 2,700 SF" },
      { label: "Delivery", value: "Fabricate + Install" },
    ],
    details: [
      { src: "/images/magnolia/deck/page-09.webp", label: "Mosaic woodgrains" },
      { src: "/images/magnolia/deck/page-10.webp", label: "Alucobond ACM" },
      { src: "/images/magnolia/deck/page-11.webp", label: "Garage screening" },
    ],
  },
  {
    eyebrow: "04 / Division 8",
    title: "Glazing, coordinated.",
    body: "Unitized curtain wall, stick curtain wall, storefront, and entrances are resolved as a connected system, not isolated products.",
    image: "/images/magnolia/04-north-elevation.png",
    stats: [
      { label: "Curtain Wall", value: "GW-7000" },
      { label: "Storefront", value: "ES-7525" },
      { label: "Entrances", value: "ES-46T + ES-9000" },
    ],
    details: [
      { src: "/images/magnolia/deck/page-14.webp", label: "Curtain wall systems" },
      { src: "/images/magnolia/deck/page-15.webp", label: "Entrance systems" },
      { src: "/images/magnolia/deck/page-16.webp", label: "GW-7000 detail" },
    ],
  },
  {
    eyebrow: "05 / Delivery",
    title: "Factory to field.",
    body: "Production, shipping, transportation, and jobsite delivery stay visible in one coordinated line of sight.",
    image: "/images/magnolia/06-southwest-elevation.png",
    stats: [
      { label: "Factory + Shipping", value: "5 Days" },
      { label: "Transportation", value: "2 Days" },
      { label: "Arrival", value: "Sequenced" },
    ],
    details: [
      { src: "/images/magnolia/deck/page-04.webp", label: "Delivery sequence" },
    ],
  },
  {
    eyebrow: "06 / Quality Control",
    title: "Quality is a deliverable.",
    body: "Performance requirements, submittals, samples, mockups, fabrication checks, and field verification remain part of the presentation record.",
    image: "/images/magnolia/01-southeast-oblique.png",
    stats: [
      { label: "Performance", value: "EMR + System Ratings" },
      { label: "Controls", value: "Documented QA/QC" },
      { label: "Review", value: "Stakeholder Ready" },
    ],
    details: [
      { src: "/images/magnolia/deck/page-18.webp", label: "Performance ratings" },
      { src: "/images/magnolia/deck/page-19.webp", label: "Quality assurance plan" },
    ],
  },
  {
    eyebrow: "07 / Why 1CG",
    title: "Charleston proof. One accountable team.",
    body: "Schedule certainty, coastal performance, documented safety, and comparable local execution come together under one coordinated envelope partner.",
    image: "/images/magnolia/01-southeast-oblique.png",
    stats: [
      { label: "Schedule", value: "Floor-by-Floor" },
      { label: "Safety", value: "0.78 EMR" },
      { label: "Local Proof", value: "Charleston Portfolio" },
    ],
    details: [
      { src: "/images/magnolia/deck/page-18.webp", label: "Documented safety" },
      { src: "/images/magnolia/deck/page-21.webp", label: "Comparable Charleston execution" },
    ],
  },
  {
    eyebrow: "08 / Relevant Work",
    title: "The right proof is already in the room.",
    body: "Comparable hospitality, office, and mixed-use work gives stakeholders immediate context for scale, systems, and execution.",
    image: "/images/magnolia/02-east-elevation.png",
    stats: [
      { label: "Hospitality", value: "Waterfront Hotel" },
      { label: "Mixed-Use", value: "22 WestEdge" },
      { label: "Office", value: "Morrison Yard" },
    ],
    details: [
      { src: "/images/magnolia/deck/page-20.webp", label: "Waterfront Hotel" },
      { src: "/images/magnolia/deck/page-21.webp", label: "22 WestEdge" },
      { src: "/images/magnolia/deck/page-22.webp", label: "Morrison Yard" },
    ],
  },
  {
    eyebrow: "09 / Magnolia Landing Project Pin",
    title: "Ready for the room.",
    body: "One link. Fullscreen playback. The technical source remains available when the conversation needs it.",
    image: "/images/magnolia/06-southwest-elevation.png",
    video: "/videos/magnolia/magnolia-timelapse.mp4",
    stats: [
      { label: "Playback", value: "Responsive 16:9" },
      { label: "Source", value: "Original Quality" },
      { label: "Next Step", value: "Coordinate Scope" },
    ],
  },
];

const pad = (value: number) => String(value).padStart(2, "0");

export function MagnoliaPresentationPlayer() {
  const [curtains, isTransitioning] = useCurtains();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controlsTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [deckPreviewIndex, setDeckPreviewIndex] = useState<number | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const current = slides[index];
  const backgroundVideo = uploadedVideoUrl ?? current.video;
  const hideNarrative = isPlaying && Boolean(backgroundVideo);

  const goTo = useCallback((next: number) => {
    if (isTransitioning) return;
    const normalized = (next + slides.length) % slides.length;
    const scope = stageRef.current;
    if (!scope) {
      setIndex(normalized);
      return;
    }
    const slatSize = Math.max(54, Math.min(96, Math.round(scope.clientHeight / 8)));
    void curtains(() => setIndex(normalized), {
      effect: blinds({ direction: "row", directionMode: "normal", size: slatSize }),
      transition: [{ duration: 0.34 }, { duration: 0.42 }],
      scope,
    });
  }, [curtains, isTransitioning]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    if (isPlaying && !isMenuOpen) {
      controlsTimerRef.current = window.setTimeout(() => setControlsVisible(false), 2600);
    }
  }, [isMenuOpen, isPlaying]);

  const reset = useCallback(() => {
    setIndex(0);
    setIsPlaying(false);
    setControlsVisible(true);
    setIsMenuOpen(false);
    setIsDeckOpen(false);
    setDeckPreviewIndex(null);
    if (document.fullscreenElement) void document.exitFullscreen();
  }, []);

  const startPlayback = useCallback(async () => {
    setIsPlaying(true);
    setIsMenuOpen(false);
    setControlsVisible(true);
    if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => setControlsVisible(false), 2600);
    try {
      await stageRef.current?.requestFullscreen?.();
    } catch {
      // Playback remains available when browser fullscreen is blocked.
    }
    await videoRef.current?.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => goTo(index + 1), current.durationMs ?? 7600);
    return () => window.clearTimeout(timer);
  }, [current.durationMs, goTo, index, isPlaying]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === " ") {
        event.preventDefault();
        if (isPlaying) setIsPlaying(false);
        else void startPlayback();
      }
      if (event.key === "Escape") setIsMenuOpen(false);
      if (event.key === "Escape") {
        setIsDeckOpen(false);
        setDeckPreviewIndex(null);
      }
      revealControls();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index, isPlaying, revealControls, startPlayback]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    if (isPlaying) void video.play().catch(() => undefined);
    else video.pause();
  }, [backgroundVideo, isMuted, isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
      if (uploadedVideoUrl) URL.revokeObjectURL(uploadedVideoUrl);
    };
  }, [uploadedVideoUrl]);

  return (
    <main className="min-h-screen bg-[#050505] p-2 text-white sm:p-4 lg:p-6">
      <div
        ref={stageRef}
        className="presentation-stage group relative mx-auto flex max-w-[1920px] flex-col overflow-hidden bg-black shadow-2xl shadow-black/40"
        onPointerMove={revealControls}
        onTouchStart={(event) => {
          touchStartRef.current = event.touches[0]?.clientX ?? null;
          revealControls();
        }}
        onTouchEnd={(event) => {
          const start = touchStartRef.current;
          const end = event.changedTouches[0]?.clientX;
          touchStartRef.current = null;
          if (start == null || end == null || Math.abs(end - start) < 44) return;
          goTo(index + (end < start ? 1 : -1));
        }}
      >
        <div className="absolute inset-0">
          {backgroundVideo ? (
            <video
              ref={videoRef}
              key={backgroundVideo}
              className="h-full w-full object-cover"
              src={backgroundVideo}
              poster={current.image}
              muted={isMuted}
              loop
              playsInline
            />
          ) : (
            <Image
              key={current.image}
              src={current.image}
              alt=""
              fill
              priority={index < 2}
              sizes="100vw"
              className="magnolia-scene-image object-cover"
            />
          )}
          <div
            className={`absolute inset-0 transition-all duration-700 ${
              hideNarrative
                ? "bg-black/10"
                : "bg-[linear-gradient(90deg,rgba(0,0,0,0.9),rgba(0,0,0,0.44)_48%,rgba(0,0,0,0.18)),linear-gradient(0deg,rgba(0,0,0,0.86),transparent_58%)]"
            }`}
          />
        </div>

        <header
          className={`relative z-30 flex items-center justify-between gap-3 p-4 transition-opacity duration-300 sm:p-6 ${controlsVisible || isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <Link
            href="/project-pins"
            className="inline-flex items-center gap-3 rounded-full border border-white/14 bg-black/28 py-2 pl-3 pr-4 text-xs font-medium text-white backdrop-blur-xl transition hover:bg-black/48"
          >
            <ArrowLeft size={14} />
            <Image
              src="/logo/1cg-line.svg"
              alt="1CG"
              width={74}
              height={42}
              className="h-auto w-[54px] brightness-0 invert"
            />
            <span className="hidden sm:inline">Project Pins</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startPlayback}
              className="hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-black sm:inline-flex"
            >
              <Maximize2 size={14} /> Present
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((value) => !value)}
                className="grid size-10 place-items-center rounded-full border border-white/14 bg-black/28 text-white backdrop-blur-xl transition hover:bg-black/48"
                aria-expanded={isMenuOpen}
                aria-label="Open presentation menu"
              >
                <MoreHorizontal size={18} />
              </button>
              {isMenuOpen ? (
                <div className="absolute right-0 top-12 w-[min(310px,calc(100vw-2rem))] border border-white/14 bg-black/92 p-2 text-sm shadow-2xl backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => setIsMuted((value) => !value)}
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-white/82 hover:bg-white/10"
                  >
                    Audio {isMuted ? "Muted" : "On"}
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-white/82 hover:bg-white/10"
                  >
                    Preview Source Video
                    <Upload size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setIsMenuOpen(false);
                      setDeckPreviewIndex(null);
                      setIsDeckOpen(true);
                    }}
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-white/82 hover:bg-white/10"
                  >
                    Preview Source Deck
                    <LayoutGrid size={16} />
                  </button>
                  <a
                    href="/documents/magnolia-landing-deck.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-white/82 hover:bg-white/10"
                  >
                    Open Technical Deck
                    <Download size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={reset}
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-white/82 hover:bg-white/10"
                  >
                    Restart Presentation
                    <RotateCcw size={16} />
                  </button>
                  <div className="mt-2 border-t border-white/12 px-3 py-3 text-xs leading-5 text-white/50">
                    Responsive 16:9 presentation. Uploaded video previews at its original source quality.
                    {uploadedFile ? <span className="mt-2 block text-white/78">Source: {uploadedFile}</span> : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section
          key={index}
          aria-hidden={hideNarrative}
          className={`magnolia-scene relative z-10 mt-auto grid gap-6 px-5 pb-4 transition-all duration-700 sm:px-8 sm:pb-6 lg:items-end lg:gap-10 lg:px-12 ${
            hideNarrative ? "pointer-events-none translate-y-3 opacity-0" : "translate-y-0 opacity-100"
          } ${current.details ? "lg:grid-cols-[0.82fr_1.18fr]" : "lg:grid-cols-[1fr_360px]"}`}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/58 sm:text-xs">
              {current.eyebrow}
            </p>
            <h1
              className={`mt-3 max-w-6xl font-semibold leading-[0.88] tracking-normal ${current.details ? "text-[clamp(2.7rem,5.4vw,6.5rem)]" : "text-[clamp(3.4rem,8vw,10rem)]"}`}
            >
              {current.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 sm:text-lg sm:leading-7">
              {current.body}
            </p>
            <div className="mt-5 grid max-w-3xl grid-cols-3 border-y border-white/16">
              {current.stats.map((stat) => (
                <div key={stat.label} className="min-w-0 border-r border-white/16 px-2 py-3 first:pl-0 last:border-r-0 sm:px-4 sm:py-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/42 sm:text-[10px]">
                    {stat.label}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-semibold text-white sm:mt-2 sm:text-sm">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {current.details ? (
            <aside
              className={`grid gap-2 ${current.details.length === 1 ? "grid-cols-1" : current.details.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
              aria-label="Technical source material"
            >
              {current.details.map((detail) => (
                <figure key={detail.src} className="overflow-hidden border border-white/16 bg-white p-1 shadow-2xl shadow-black/30 sm:p-2">
                  <div className="relative aspect-video overflow-hidden bg-[#f3f3f1]">
                    <Image
                      src={detail.src}
                      alt={detail.label}
                      fill
                      sizes="(min-width: 1024px) 24vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                  <figcaption className="hidden px-1 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-black/52 sm:block">
                    {detail.label}
                  </figcaption>
                </figure>
              ))}
            </aside>
          ) : (
            <aside className="hidden border-l border-white/18 pl-6 lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/42">Project Team</p>
              <p className="mt-3 text-sm leading-6 text-white/76">
                Highland Resources<br />Pickard Chilton<br />Cooper Carry<br />1CG
              </p>
            </aside>
          )}
        </section>

        <footer
          className={`relative z-30 flex items-center gap-2 px-5 pb-5 pt-3 transition-opacity duration-300 sm:gap-3 sm:px-8 sm:pb-8 lg:px-12 ${controlsVisible || !isPlaying ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={isTransitioning}
            className="grid size-10 place-items-center rounded-full border border-white/18 bg-black/24 text-white backdrop-blur-xl sm:size-11"
            aria-label="Previous scene"
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => (isPlaying ? setIsPlaying(false) : void startPlayback())}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-black sm:h-11 sm:px-5 sm:text-sm"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
            {isPlaying ? "Pause" : "Present"}
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={isTransitioning}
            className="grid size-10 place-items-center rounded-full border border-white/18 bg-black/24 text-white backdrop-blur-xl sm:size-11"
            aria-label="Next scene"
          >
            <ArrowRight size={17} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setDeckPreviewIndex(null);
              setIsDeckOpen(true);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/18 bg-black/24 px-4 text-xs font-medium text-white backdrop-blur-xl sm:h-11"
          >
            <LayoutGrid size={15} />
            <span className="hidden sm:inline">Source deck</span>
            <span className="font-mono text-[9px] text-white/48">22</span>
          </button>
          <div className="ml-2 hidden h-px flex-1 bg-white/16 sm:block">
            <div
              className="h-px bg-white transition-all duration-500"
              style={{ width: `${((index + 1) / slides.length) * 100}%` }}
            />
          </div>
          <p className="ml-auto font-mono text-[10px] tracking-[0.16em] text-white/58 sm:ml-0 sm:text-xs">
            {pad(index + 1)} / {pad(slides.length)}
          </p>
          <Link
            href="/start-project"
            className="ml-2 hidden items-center gap-1 text-xs font-medium text-white sm:inline-flex"
          >
            Coordinate Scope <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              if (document.fullscreenElement) void document.exitFullscreen();
            }}
            className="ml-1 hidden size-10 place-items-center rounded-full border border-white/18 bg-black/24 text-white backdrop-blur-xl sm:grid"
            aria-label="Exit presentation"
          >
            <X size={17} />
          </button>
        </footer>

        {isDeckOpen ? (
          <div className="absolute inset-0 z-[60] overflow-y-auto bg-[#090909]/98 text-white backdrop-blur-xl">
            {deckPreviewIndex == null ? (
              <div className="mx-auto max-w-[1760px] p-4 sm:p-7 lg:p-10">
                <div className="sticky top-0 z-10 mb-6 flex items-center justify-between border-b border-white/12 bg-[#090909]/94 pb-5 pt-1 backdrop-blur-xl">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/42">
                      Magnolia Landing / Source Deck
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-normal sm:text-4xl">
                      22 original slides
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeckOpen(false)}
                    className="grid size-11 place-items-center rounded-full border border-white/16 bg-white/6 text-white"
                    aria-label="Close source deck"
                  >
                    <X size={19} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {deckSlides.map((slide, slideIndex) => (
                    <button
                      key={slide.thumbnail}
                      type="button"
                      onClick={() => setDeckPreviewIndex(slideIndex)}
                      className="group overflow-hidden border border-white/12 bg-white/[0.035] text-left transition hover:-translate-y-0.5 hover:border-white/32"
                    >
                      <div className="relative aspect-video overflow-hidden bg-white">
                        <Image
                          src={slide.thumbnail}
                          alt={`Slide ${slideIndex + 1}: ${slide.title}`}
                          fill
                          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.018]"
                        />
                      </div>
                      <div className="flex items-start gap-3 p-3">
                        <span className="font-mono text-[9px] tracking-[0.14em] text-white/36">
                          {pad(slideIndex + 1)}
                        </span>
                        <span className="text-xs font-medium leading-4 text-white/76 sm:text-sm">
                          {slide.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-full flex-col p-3 sm:p-6">
                <div className="flex items-center justify-between gap-3 pb-4">
                  <button
                    type="button"
                    onClick={() => setDeckPreviewIndex(null)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/16 bg-white/6 px-4 text-xs font-medium text-white"
                  >
                    <ArrowLeft size={15} /> All slides
                  </button>
                  <p className="min-w-0 truncate text-center text-xs font-medium text-white/68 sm:text-sm">
                    {pad(deckPreviewIndex + 1)} / {pad(deckSlides.length)} · {deckSlides[deckPreviewIndex].title}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDeckPreviewIndex(null);
                      setIsDeckOpen(false);
                    }}
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-white/16 bg-white/6 text-white"
                    aria-label="Close source slide"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
                  <Image
                    key={deckSlides[deckPreviewIndex].full}
                    src={deckSlides[deckPreviewIndex].full}
                    alt={`Slide ${deckPreviewIndex + 1}: ${deckSlides[deckPreviewIndex].title}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setDeckPreviewIndex((deckPreviewIndex - 1 + deckSlides.length) % deckSlides.length)}
                    className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-white backdrop-blur-xl sm:left-5"
                    aria-label="Previous source slide"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeckPreviewIndex((deckPreviewIndex + 1) % deckSlides.length)}
                    className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-white backdrop-blur-xl sm:right-5"
                    aria-label="Next source slide"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {!isPlaying && !isDeckOpen && index === 0 ? (
          <button
            type="button"
            onClick={startPlayback}
            className="absolute inset-0 z-20 grid place-items-center bg-black/6 text-white transition hover:bg-transparent"
            aria-label="Present Magnolia Landing fullscreen"
          >
            <span className="grid size-20 place-items-center rounded-full bg-white text-black shadow-2xl shadow-black/30 transition hover:scale-105 sm:size-24">
              <Play size={32} fill="currentColor" />
            </span>
          </button>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploadedFile(file.name);
            setUploadedVideoUrl(URL.createObjectURL(file));
            setIndex(0);
            setIsPlaying(false);
            setControlsVisible(true);
          }}
        />
      </div>
    </main>
  );
}
