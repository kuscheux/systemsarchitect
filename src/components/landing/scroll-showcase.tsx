"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FadeImage } from "@/components/fade-image";
import { RealLocationsMap } from "@/components/real-locations-map";
import type { Project } from "@/data/projects";

const defaultVideo = "/videos/1cg-install-timeline.mp4";
const heroScrollVideo = "/videos/1min.mp4";
const experimentalTourVideo = "/videos/charlotte-short.mp4";
const foundedYear = 2006;
const currentYear = 2026;
const yearSequence = Array.from(
  { length: currentYear - foundedYear + 1 },
  (_, index) => String((foundedYear + index) % 100).padStart(2, "0"),
);

function projectByName(projects: Project[], name: string) {
  return projects.find((project) => project.name === name) ?? projects[0];
}

function useScrollProgress<T extends HTMLElement>(
  scrollScreens = 2,
): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const scrollableHeight = window.innerHeight * scrollScreens;
      setProgress(Math.max(0, Math.min(1, scrolled / scrollableHeight)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollScreens]);

  return [ref, progress];
}

function MediaFrame({
  project,
  className = "",
  priority = false,
}: {
  project: Project;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group relative block overflow-hidden bg-neutral-200 ${className}`}
    >
      <FadeImage
        src={project.image}
        alt={project.name}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 45vw, 90vw"
        className="object-cover"
      />
      <video
        className="ai-photo-video absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
        src={project.video || defaultVideo}
        muted
        loop
        playsInline
        preload="none"
        onMouseEnter={(event) => {
          event.currentTarget.currentTime = 0;
          event.currentTarget.play().catch(() => {
            // Hover exit can interrupt playback before the browser resolves play().
          });
        }}
        onMouseLeave={(event) => {
          event.currentTarget.pause();
          event.currentTarget.currentTime = 0;
        }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 to-transparent p-5 text-white opacity-0 transition duration-300 group-hover:opacity-100">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/65">
          {project.market}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-[-0.045em]">
          {project.name}
        </h3>
      </div>
    </Link>
  );
}

function HeroScrollGrid({ projects }: { projects: Project[] }) {
  const [sectionRef, scrollProgress] = useScrollProgress<HTMLElement>(2);
  const sideFrames = [
    projectByName(projects, "22 Westedge"),
    projectByName(projects, "The Square at South End"),
    projectByName(projects, "Georgia State University Science"),
    projectByName(projects, "Moxy Hotel"),
  ];

  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.18) / 0.82));
  const centerWidth = 100 - imageProgress * 58;
  const centerHeight = 100 - imageProgress * 26;
  const sideWidth = imageProgress * 22;
  const sideOpacity = imageProgress;
  const borderRadius = imageProgress * 22;
  const gap = imageProgress * 16;
  const leftTranslate = -100 + imageProgress * 100;
  const rightTranslate = 100 - imageProgress * 100;
  const yearProgress = Math.max(0, Math.min(1, scrollProgress / 0.36));

  return (
    <section ref={sectionRef} className="relative bg-background">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="relative flex h-full w-full items-stretch justify-center"
            style={{
              gap,
              padding: imageProgress * 16,
              paddingBottom: 58 + imageProgress * 42,
            }}
          >
            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap,
                opacity: sideOpacity,
                transform: `translateX(${leftTranslate}%) translateY(${-imageProgress * 10}%)`,
              }}
            >
              {sideFrames.slice(0, 2).map((project) => (
                <div
                  key={project.slug}
                  className="relative flex-1 overflow-hidden"
                  style={{ borderRadius }}
                >
                  <MediaFrame project={project} className="h-full w-full" />
                </div>
              ))}
            </div>

            <div
              className="relative flex-none overflow-hidden bg-neutral-950 will-change-transform"
              style={{
                width: `${centerWidth}%`,
                height: `${centerHeight}%`,
                borderRadius,
              }}
            >
              <video
                className="ai-photo-video absolute inset-0 h-full w-full object-cover"
                src={heroScrollVideo}
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-black/30" />
              <div
                className="absolute inset-0 flex items-end overflow-hidden"
              >
                <YearRolodex progress={yearProgress} />
              </div>
              <div
                className="absolute left-5 top-24 max-w-sm text-white md:left-8 md:top-28"
                style={{ opacity: 0.18 + imageProgress * 0.82 }}
              >
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/65">
                  Southeast commercial glazing
                </p>
                <p className="mt-2 text-xl font-medium tracking-[-0.04em] md:text-2xl">
                  Façade systems that move from preconstruction to installation.
                </p>
              </div>
            </div>

            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap,
                opacity: sideOpacity,
                transform: `translateX(${rightTranslate}%) translateY(${-imageProgress * 10}%)`,
              }}
            >
              {sideFrames.slice(2).map((project) => (
                <div
                  key={project.slug}
                  className="relative flex-1 overflow-hidden"
                  style={{ borderRadius }}
                >
                  <MediaFrame project={project} className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[200vh]" />
    </section>
  );
}

function YearRolodex({ progress }: { progress: number }) {
  const rowHeight = 0.82;
  const translate = -progress * (yearSequence.length - 1) * rowHeight;

  return (
    <div className="w-full px-4 pb-4 md:px-8 md:pb-7">
      <div className="flex items-end text-[23vw] font-semibold leading-[0.82] tracking-[-0.085em] text-white/82 md:text-[18vw]">
        <span>20</span>
        <div className="relative h-[0.82em] overflow-hidden">
          <div
            className="will-change-transform"
            style={{
              transform: `translate3d(0, ${translate}em, 0)`,
              transition: "transform 160ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {yearSequence.map((year) => (
              <span key={year} className="block h-[0.82em]">
                {year}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-white/58">
        20 years of quality and precision
      </p>
    </div>
  );
}

function HeroStatement() {
  return (
    <section className="relative z-10 bg-background px-6 py-28 text-center md:px-12 md:py-40 lg:px-20">
      <p className="mx-auto max-w-5xl text-3xl font-medium leading-[1.04] tracking-[-0.055em] text-foreground md:text-5xl lg:text-[4.9rem]">
        Commercial glass, glazing, and façade execution for buildings where
        coordination is the whole job.
      </p>
    </section>
  );
}

function SlidingProof({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const left = projectByName(projects, "110 East");
  const right = projectByName(projects, "Morrison Yard Office Building");

  const updateTransforms = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const scrollableRange = sectionRef.current.offsetHeight - window.innerHeight;
    const next = Math.max(0, Math.min(1, -rect.top / scrollableRange));
    setProgress(next);
  }, []);

  useEffect(() => {
    let raf: number | null = null;
    const handleScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateTransforms);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTransforms();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [updateTransforms]);

  return (
    <section id="proof" className="bg-background">
      <div ref={sectionRef} className="relative h-[200vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 flex items-center justify-center px-6 text-center"
            style={{ opacity: 1 - progress }}
          >
            <div>
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Kladding + Glass
              </p>
              <h2 className="max-w-6xl text-[13vw] font-semibold leading-[0.82] tracking-[-0.085em] text-foreground md:text-[9vw]">
                Stronger
                <br />
                Together.
              </h2>
              <div className="mx-auto mt-6 flex w-fit items-center rounded-full border border-border bg-white/70 px-6 py-3 shadow-[0_18px_60px_rgba(9,11,15,0.08)] backdrop-blur-xl">
                <Image
                  src="/logo/1cg-line.svg"
                  alt="1CG"
                  width={120}
                  height={48}
                  className="h-9 w-auto"
                />
              </div>
              <p className="mx-auto mt-6 max-w-xl font-mono text-xs uppercase tracking-[0.12em] text-muted">
                No. 23 in the U.S. / Glass Magazine Top 50 Glaziers
              </p>
            </div>
          </div>

          <div className="relative z-10 grid w-full gap-4 px-6 md:grid-cols-2 md:px-12 lg:px-20">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-[24px]"
              style={{ transform: `translate3d(${(1 - progress) * -100}%,0,0)` }}
            >
              <MediaFrame project={left} className="h-full w-full" priority />
              <span className="absolute bottom-5 left-5 rounded-full bg-white/72 px-4 py-2 text-sm font-medium text-neutral-950 backdrop-blur-md">
                Kladding, glass, and high-rise façade scope
              </span>
            </div>
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-[24px]"
              style={{ transform: `translate3d(${(1 - progress) * 100}%,0,0)` }}
            >
              <MediaFrame project={right} className="h-full w-full" />
              <span className="absolute bottom-5 left-5 rounded-full bg-white/72 px-4 py-2 text-sm font-medium text-neutral-950 backdrop-blur-md">
                Curtain wall, storefront, and field execution
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-24 text-center md:px-12 lg:px-20">
        <p className="mx-auto max-w-5xl text-3xl leading-tight tracking-[-0.055em] text-muted md:text-5xl">
          Ranked No. 23 on Glass Magazine&apos;s 2025 Top 50 Glaziers list, 1CG is
          built for general contractors, architects, developers, and owners who
          need Kladding, glass, fabrication, and installation to land cleanly.
        </p>
      </div>
    </section>
  );
}

function FeatureGrid({ projects }: { projects: Project[] }) {
  const features = [
    ["Curtain wall", "Office, civic, education, healthcare, and mixed-use towers.", "110 East"],
    ["Storefront & entrances", "Public-facing glass systems that handle traffic and hardware.", "Charlotte Douglas International Airport"],
    ["Window wall", "Residential and mixed-use repetition with façade discipline.", "Society Atlanta"],
    ["Interior glass", "Transparency, separation, and polished interior finish quality.", "Emory University Campus Life Building"],
    ["Integrated cladding", "Glass as one coordinated part of a complete exterior envelope.", "5th + Broadway"],
    ["Fabrication control", "100,000 sq. ft. shop capacity for quality and schedule.", "The Hub & Nexus"],
  ];

  return (
    <section id="systems" className="bg-background">
      <div className="px-6 py-20 text-center md:px-12 md:py-28 lg:px-20">
        <h2 className="text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-6xl">
          Systems for complex buildings.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-muted">
          1CG turns glass, entrances, façade details, and installation sequence
          into one coordinated construction package.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 px-6 pb-24 md:grid-cols-3 md:px-12 lg:px-20">
        {features.map(([title, body, projectName], index) => {
          const project = projectByName(projects, projectName);
          return (
            <article key={title} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-secondary">
                <FadeImage
                  src={project.image}
                  alt={project.name}
                  fill
                  fadeDelay={index * 60}
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105"
                />
              </div>
              <div className="py-6">
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {project.market}
                </p>
                <h3 className="text-2xl font-semibold tracking-[-0.045em] text-foreground">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ScrollRevealText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const start = window.innerHeight * 0.9;
      const end = window.innerHeight * 0.12;
      setProgress(Math.max(0, Math.min(1, (start - rect.top) / (start - end))));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const words = text.split(" ");

  return (
    <p ref={ref} className="text-3xl font-semibold leading-snug tracking-[-0.05em] md:text-5xl lg:text-6xl">
      {words.map((word, index) => {
        const isRevealed = progress > index / words.length;
        return (
          <span
            key={`${word}-${index}`}
            className="transition-colors duration-150"
            style={{ color: isRevealed ? "var(--foreground)" : "rgba(9, 11, 15, 0.18)" }}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}

function PinnedExecutionStory({ projects }: { projects: Project[] }) {
  const scrollScreens = 5;
  const [sectionRef, scrollProgress] = useScrollProgress<HTMLElement>(scrollScreens);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const sideFrames = [
    projectByName(projects, "110 East"),
    projectByName(projects, "The Refinery"),
    projectByName(projects, "Moxy Hotel"),
    projectByName(projects, "Charlotte Convention Center"),
  ];

  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.18) / 0.82));
  const centerWidth = 100 - imageProgress * 58;
  const sideWidth = imageProgress * 22;
  const sideOpacity = imageProgress;
  const borderRadius = imageProgress * 22;
  const gap = imageProgress * 16;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoDuration) return;

    const targetTime = Math.min(videoDuration - 0.04, scrollProgress * videoDuration);
    if (Math.abs(video.currentTime - targetTime) > 0.035 && !video.seeking) {
      video.currentTime = targetTime;
    }
  }, [scrollProgress, videoDuration]);

  return (
    <section ref={sectionRef} className="relative bg-background text-foreground">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          <div className="relative flex h-full w-full items-stretch justify-center" style={{ gap, padding: imageProgress * 16 }}>
            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap,
                opacity: sideOpacity,
                transform: `translateX(${-100 + imageProgress * 100}%)`,
              }}
            >
              {sideFrames.slice(0, 2).map((project) => (
                <div key={project.slug} className="relative flex-1 overflow-hidden" style={{ borderRadius }}>
                  <MediaFrame project={project} className="h-full w-full" />
                </div>
              ))}
            </div>

            <div className="relative flex-none overflow-hidden" style={{ width: `${centerWidth}%`, height: "100%", borderRadius }}>
              <video
                ref={videoRef}
                src={experimentalTourVideo}
                className="ai-photo-video absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={(event) => {
                  setVideoDuration(event.currentTarget.duration);
                  event.currentTarget.pause();
                  event.currentTarget.currentTime = 0;
                }}
              />
              <div className="absolute inset-0 bg-white/12" />
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <h2 className="max-w-5xl text-5xl font-semibold leading-[0.9] tracking-[-0.075em] text-white md:text-7xl lg:text-8xl">
                  {["Experimental", "project", "tour."].map((word, index) => {
                    const start = index * 0.07;
                    const progress = Math.max(0, Math.min(1, (scrollProgress - start) / 0.08));
                    return (
                      <span
                        key={word}
                        className="inline-block"
                        style={{
                          opacity: 1 - progress,
                          filter: `blur(${progress * 10}px)`,
                          marginRight: index < 2 ? "0.25em" : 0,
                        }}
                      >
                        {word}
                        {index === 1 ? <br /> : index < 2 ? " " : null}
                      </span>
                    );
                  })}
                </h2>
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-white/82 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-950 backdrop-blur-md">
                  One-shot walkthrough
                </span>
                <span className="rounded-full bg-white/82 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-950 backdrop-blur-md">
                  Scroll controls the cut
                </span>
              </div>
            </div>

            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap,
                opacity: sideOpacity,
                transform: `translateX(${100 - imageProgress * 100}%)`,
              }}
            >
              {sideFrames.slice(2).map((project) => (
                <div key={project.slug} className="relative flex-1 overflow-hidden" style={{ borderRadius }}>
                  <MediaFrame project={project} className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: `${scrollScreens * 100}vh` }} />
    </section>
  );
}

function ExecutionStatement() {
  return (
    <section className="relative z-10 bg-background px-6 py-24 text-foreground md:px-12 md:py-36 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <ScrollRevealText text="From early budgeting and constructability through fabrication, staging, and installation, 1CG gives complex construction teams one accountable glazing partner across the Southeast." />
      </div>
    </section>
  );
}

function HorizontalProjectGallery({ projects }: { projects: Project[] }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sectionHeight, setSectionHeight] = useState("100vh");
  const [translateX, setTranslateX] = useState(0);

  const galleryProjects = useMemo(
    () =>
      [
        "Hotel Bennett",
        "Timbers Kiawah – Ocean Club & Residence",
        "Society Atlanta",
        "5th + Broadway",
        "Charlotte Douglas International Airport",
        "Emory Health Sciences Research",
        "Bank of America Stadium",
        "The Refinery",
      ].map((name) => projectByName(projects, name)),
    [projects],
  );

  const calculate = useCallback(() => {
    if (!containerRef.current) return;
    const total = containerRef.current.scrollWidth - window.innerWidth;
    setSectionHeight(`${window.innerHeight + Math.max(total, 1)}px`);
  }, []);

  const updateTransform = useCallback(() => {
    if (!galleryRef.current || !containerRef.current) return;
    const total = containerRef.current.scrollWidth - window.innerWidth;
    const scrolled = Math.max(0, -galleryRef.current.getBoundingClientRect().top);
    setTranslateX(Math.min(1, scrolled / Math.max(total, 1)) * -total);
  }, []);

  useEffect(() => {
    let raf: number | null = null;
    const resizeTimer = window.setTimeout(calculate, 100);
    const handleScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateTransform);
    };
    window.addEventListener("resize", calculate);
    window.addEventListener("scroll", handleScroll, { passive: true });
    calculate();
    updateTransform();
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", calculate);
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [calculate, updateTransform]);

  return (
    <section id="gallery" ref={galleryRef} className="relative bg-background" style={{ height: sectionHeight }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full items-center">
          <div
            ref={containerRef}
            className="flex gap-6 px-6 md:px-12 lg:px-20"
            style={{ transform: `translate3d(${translateX}px, 0, 0)` }}
          >
            <div className="flex h-[70vh] w-[72vw] flex-shrink-0 items-center md:w-[42vw]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  Project gallery
                </p>
                <h2 className="mt-4 text-5xl font-semibold leading-[0.9] tracking-[-0.075em] md:text-7xl">
                  Built across the Southeast.
                </h2>
              </div>
            </div>
            {galleryProjects.map((project, index) => (
              <Link
                href={`/projects/${project.slug}`}
                key={`${project.slug}-${index}`}
                className="group relative h-[70vh] w-[85vw] flex-shrink-0 overflow-hidden rounded-[24px] bg-secondary md:w-[60vw] lg:w-[45vw]"
              >
                <FadeImage
                  src={project.image}
                  alt={project.name}
                  fill
                  priority={index < 2}
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/78 to-transparent p-7 text-white">
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-white/65">
                    {project.region} / {project.market}
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.055em]">
                    {project.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCollection() {
  const services = [
    ["Curtain Wall", "High-performance exterior glass systems for towers, civic buildings, campuses, and mixed-use work."],
    ["Storefront & Entrances", "Durable, accessible public-facing systems where hardware, traffic, and first impressions matter."],
    ["Window Wall", "Repeatable façade systems for residential, mixed-use, student housing, and high-rise apartments."],
    ["Interior Glass", "Transparent separation and polished finish quality for workplaces, schools, healthcare, and amenities."],
    ["Integrated Cladding", "Façade coordination that brings glazing, entrances, storefront, and exterior detailing together."],
    ["Preconstruction", "Scope, budget, sequencing, constructability, and risk evaluation before field work starts."],
  ];

  return (
    <section id="services" className="bg-background">
      <div className="px-6 py-20 md:px-12 lg:px-20">
        <h2 className="text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-6xl">
          Execution scopes
        </h2>
      </div>
      <div className="grid gap-5 px-6 pb-24 md:grid-cols-3 md:px-12 lg:px-20">
        {services.map(([name, description], index) => (
          <article key={name} className="group min-h-80 rounded-[24px] border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(10,12,16,0.10)]">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-20 text-3xl font-semibold tracking-[-0.055em] text-foreground">
              {name}
            </h3>
            <p className="mt-4 text-sm leading-6 text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatsAndVideo() {
  const specs = [
    ["20+", "Years"],
    ["72", "Projects"],
    ["3", "Offices"],
    ["100K", "Sq. ft. shop"],
  ];

  return (
    <section className="bg-background">
      <div className="grid grid-cols-2 border-y border-border md:grid-cols-4">
        {specs.map(([value, label]) => (
          <div key={label} className="border-b border-r border-border p-8 text-center last:border-r-0 md:border-b-0">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {label}
            </p>
            <p className="text-5xl font-semibold tracking-[-0.065em] text-foreground">
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="ai-photo-video absolute inset-0 h-full w-full object-cover"
          src={defaultVideo}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </section>
  );
}

function FinalStatement() {
  return (
    <section className="bg-background">
      <div className="px-6 py-24 md:px-12 md:py-32 lg:px-20 lg:py-40">
        <p className="mx-auto max-w-6xl text-3xl font-medium leading-tight tracking-[-0.055em] text-foreground md:text-5xl lg:text-[4.8rem]">
          1CG is the Southeast commercial glazing and façade partner that can
          take a project from preconstruction to fabrication to installation
          across education, healthcare, civic, mixed-use, office, hospitality,
          residential, industrial, and transportation work.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-80"
          >
            Explore all projects <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ScrollShowcase({ projects }: { projects: Project[] }) {
  return (
    <>
      <HeroScrollGrid projects={projects} />
      <HeroStatement />
      <SlidingProof projects={projects} />
      <FeatureGrid projects={projects} />
      <PinnedExecutionStory projects={projects} />
      <ExecutionStatement />
      <HorizontalProjectGallery projects={projects} />
      <ServiceCollection />
      <StatsAndVideo />
      <RealLocationsMap projects={projects} />
      <FinalStatement />
    </>
  );
}
