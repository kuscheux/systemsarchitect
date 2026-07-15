"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, LocateFixed, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  ProjectMapCore,
  type MappableProject,
  type ProjectMapCoreHandle,
} from "@/components/maps/project-map-core";
import type { PortalProject } from "@/lib/portal/types";
import { StatusBadge } from "./portal-ui";

export function PortalProjectMap({ projects }: { projects: PortalProject[] }) {
  const mapRef = useRef<ProjectMapCoreHandle | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const mappedProjects = useMemo(
    () => projects.filter((project) => project.latitude != null && project.longitude != null),
    [projects],
  );
  const visibleProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return mappedProjects;
    return mappedProjects.filter((project) =>
      [project.name, project.client_name, project.location, project.market]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [mappedProjects, query]);
  const mapLocations = useMemo<MappableProject[]>(
    () =>
      visibleProjects.map((project) => ({
        id: project.id,
        name: project.name,
        longitude: project.longitude as number,
        latitude: project.latitude as number,
        kind: "project",
        status: project.status === "pending" ? "pending" : "complete",
      })),
    [visibleProjects],
  );
  const selected = projects.find((project) => project.id === selectedId) ?? null;

  return (
    <section className="grid min-h-[680px] overflow-hidden border border-zinc-200 bg-white xl:grid-cols-[minmax(0,1.5fr)_430px]">
      <div className="relative min-h-[520px] bg-zinc-100">
        <div className="absolute inset-0">
          <ProjectMapCore
            ref={mapRef}
            locations={mapLocations}
            selectedId={selectedId || null}
            onSelect={setSelectedId}
            cameraPreset="southeast"
            appearance="light"
            mode="presentation"
            showBuildings
            showControls
          />
        </div>
        <button
          type="button"
          onClick={() => mapRef.current?.fitPreset("southeast")}
          className="absolute left-4 top-4 z-10 inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-xs font-medium"
        >
          <LocateFixed size={14} /> All projects
        </button>
        {selected ? (
          <div className="absolute bottom-4 left-4 z-10 max-w-sm border border-zinc-200 bg-white p-4">
            <div className="flex items-start gap-4">
              <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-zinc-100">
                {selected.image_url ? <Image src={selected.image_url} alt="" fill sizes="96px" className="object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5"><StatusBadge value={selected.status} /><StatusBadge value={selected.public_visibility_status} /></div>
                <h2 className="mt-3 truncate text-lg font-semibold tracking-[-0.03em]">{selected.name}</h2>
                <p className="mt-1 text-xs text-zinc-500">{selected.location}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/portal/projects/${selected.id}`} className="inline-flex items-center gap-2 text-xs font-medium">Open CRM <ArrowRight size={13} /></Link>
              {selected.presentation_url ? <Link href={selected.presentation_url} className="inline-flex items-center gap-2 text-xs font-medium">Presentation <ExternalLink size={13} /></Link> : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-col border-t border-zinc-200 xl:border-l xl:border-t-0">
        <div className="border-b border-zinc-200 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Private CRM map</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">{mappedProjects.length} mapped projects</h2>
          <label className="relative mt-4 block">
            <Search size={15} className="absolute left-3 top-3.5 text-zinc-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="h-11 w-full border border-zinc-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-zinc-950" />
          </label>
        </div>
        <div className="max-h-[680px] flex-1 divide-y divide-zinc-100 overflow-y-auto">
          {visibleProjects.map((project) => (
            <button key={project.id} type="button" onClick={() => setSelectedId(project.id)} className={`grid w-full grid-cols-[88px_1fr] gap-4 p-4 text-left transition hover:bg-zinc-50 ${selectedId === project.id ? "bg-zinc-100" : ""}`}>
              <span className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                {project.image_url ? <Image src={project.image_url} alt="" fill sizes="88px" className="object-cover" /> : null}
              </span>
              <span className="min-w-0 self-center">
                <span className="block truncate text-sm font-semibold">{project.name}</span>
                <span className="mt-1 block truncate text-xs text-zinc-500">{project.market || "Market pending"} · {project.location}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
