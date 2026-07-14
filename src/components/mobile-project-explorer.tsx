"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronUp,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { TouchEvent, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { getProjectLocation } from "@/data/project-locations";

type MobileProjectExplorerProps = {
  projects: Project[];
  selectedProject: Project | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (project: Project) => void;
  onClearSelection: () => void;
  onClose: () => void;
};

export function MobileProjectExplorer({
  projects,
  selectedProject,
  query,
  onQueryChange,
  onSelect,
  onClearSelection,
  onClose,
}: MobileProjectExplorerProps) {
  const [isFullSheet, setIsFullSheet] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  function startPull(event: TouchEvent<HTMLDivElement>) {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function finishPull(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartY.current;
    const end = event.changedTouches[0]?.clientY;
    touchStartY.current = null;
    if (start !== null && end !== undefined && start - end > 52) setIsFullSheet(true);
  }

  const selectedLocation = selectedProject
    ? getProjectLocation(selectedProject.slug)
    : null;

  return (
    <div className="relative h-full min-h-0 overflow-hidden lg:hidden">
      <section
        aria-hidden={Boolean(selectedProject)}
        className={`absolute inset-0 flex min-h-0 flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          selectedProject ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <header className="border-b border-border p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="public-eyebrow">Project Explorer</p>
              <h3 className="public-card-title mt-2 text-foreground">All Southeast Projects</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background"
              aria-label="Close project map"
            >
              <X size={18} />
            </button>
          </div>
          <label className="mt-4 flex h-11 items-center gap-2 rounded-[8px] border border-border bg-background px-3 text-muted">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search all projects"
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </label>
        </header>

        <div
          ref={railRef}
          className="flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {projects.map((project) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => onSelect(project)}
              className="w-[76vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-[8px] border border-border bg-white text-left"
            >
              <div className="relative aspect-[4/3] bg-secondary">
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="public-eyebrow">{project.market}</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="public-card-title truncate text-xl">{project.name}</h4>
                    <p className="mt-2 truncate text-sm text-muted">{project.location}</p>
                  </div>
                  <MapPin size={17} className="mt-1 shrink-0 text-muted" />
                </div>
              </div>
            </button>
          ))}
          {projects.length === 0 ? (
            <p className="p-4 text-sm text-muted">No projects match this search.</p>
          ) : null}
        </div>
      </section>

      <section
        aria-hidden={!selectedProject}
        className={`absolute inset-0 flex min-h-0 flex-col bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          selectedProject ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedProject && selectedLocation ? (
          <div
            className="flex h-full min-h-0 flex-col"
            onTouchStart={startPull}
            onTouchEnd={finishPull}
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <button
                type="button"
                onClick={onClearSelection}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium"
              >
                <ArrowLeft size={16} /> Projects
              </button>
              <button
                type="button"
                onClick={onClose}
                className="grid size-10 place-items-center rounded-full border border-border"
                aria-label="Close project map"
              >
                <X size={18} />
              </button>
            </header>

            <button
              type="button"
              onClick={() => setIsFullSheet(true)}
              className="flex h-9 shrink-0 items-center justify-center gap-2 border-b border-border text-[11px] font-medium uppercase tracking-[0.08em] text-muted"
            >
              <span className="h-1 w-10 rounded-full bg-foreground/20" />
              Pull up for project details <ChevronUp size={13} />
            </button>

            <div className="grid min-h-0 flex-1 grid-cols-[116px_1fr] gap-4 overflow-y-auto p-4">
              <div className="relative aspect-[4/3] self-start overflow-hidden rounded-[8px] bg-secondary">
                <Image src={selectedProject.image} alt="" fill sizes="116px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="public-eyebrow">{selectedProject.market}</p>
                <h3 className="public-card-title mt-2 line-clamp-2 text-2xl">{selectedProject.name}</h3>
                <p className="mt-2 text-sm text-muted">{selectedProject.location}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Link href={`/projects/${selectedProject.slug}`} className="inline-flex items-center gap-1 text-sm font-medium">
                    View Project <ArrowUpRight size={14} />
                  </Link>
                  <Link
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium"
                  >
                    Directions <Navigation size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section
        aria-hidden={!isFullSheet}
        className={`fixed inset-0 z-[130] overflow-y-auto bg-background transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isFullSheet && selectedProject ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        {selectedProject && selectedLocation ? (
          <>
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/94 px-4 py-3 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setIsFullSheet(false)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium"
              >
                <ArrowLeft size={16} /> Back to map
              </button>
              <button
                type="button"
                onClick={onClose}
                className="grid size-10 place-items-center rounded-full border border-border bg-white"
                aria-label="Close project map"
              >
                <X size={18} />
              </button>
            </header>

            <div className="relative aspect-[4/3] w-full bg-secondary">
              <Image src={selectedProject.image} alt="" fill sizes="100vw" className="object-cover" priority />
            </div>
            <div className="px-5 pb-16 pt-8">
              <p className="public-eyebrow">{selectedProject.market} / {selectedProject.region}</p>
              <h2 className="mt-4 text-5xl font-semibold leading-[0.92] tracking-[-0.055em]">{selectedProject.name}</h2>
              <p className="mt-5 text-base leading-7 text-muted">{selectedProject.overview}</p>

              <dl className="mt-8 divide-y divide-border border-y border-border">
                {[
                  ["Location", selectedProject.location],
                  ["Project Type", selectedProject.projectType],
                  ["1CG Scope", selectedProject.scope],
                  ["Systems", selectedProject.systems],
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-2 py-4">
                    <dt className="public-eyebrow">{label}</dt>
                    <dd className="text-sm leading-6">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 grid gap-3">
                <Link
                  href={`/projects/${selectedProject.slug}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background"
                >
                  Open Full Project <ArrowUpRight size={16} />
                </Link>
                <Link
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-medium"
                >
                  Get Directions <Navigation size={16} />
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
