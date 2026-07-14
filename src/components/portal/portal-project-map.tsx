"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, LocateFixed, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import type { PortalProject } from "@/lib/portal/types";
import { StatusBadge } from "./portal-ui";

const bounds: [[number, number], [number, number]] = [
  [-87.25, 29.65],
  [-77.15, 36.65],
];

function addBuildings(map: MapLibreMap) {
  if (map.getLayer("portal-3d-buildings") || !map.getSource("openmaptiles")) return;
  const labelLayer = map.getStyle().layers?.find(
    (layer) => layer.type === "symbol" && layer.layout?.["text-field"],
  );
  map.addLayer(
    {
      id: "portal-3d-buildings",
      source: "openmaptiles",
      "source-layer": "building",
      type: "fill-extrusion",
      minzoom: 12.5,
      paint: {
        "fill-extrusion-color": "#c8cbcc",
        "fill-extrusion-height": [
          "case",
          ["!=", ["get", "render_height"], null],
          ["to-number", ["get", "render_height"]],
          ["!=", ["get", "height"], null],
          ["to-number", ["get", "height"]],
          8,
        ],
        "fill-extrusion-base": [
          "case",
          ["!=", ["get", "render_min_height"], null],
          ["to-number", ["get", "render_min_height"]],
          0,
        ],
        "fill-extrusion-opacity": 0.9,
      },
    },
    labelLayer?.id,
  );
}

export function PortalProjectMap({ projects }: { projects: PortalProject[] }) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? "");
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
  const selected = projects.find((project) => project.id === selectedId) ?? null;

  useEffect(() => {
    let mounted = true;
    async function initialize() {
      if (!mapNode.current || mapRef.current) return;
      const maplibre = await import("maplibre-gl");
      if (!mounted || !mapNode.current) return;
      const map = new maplibre.Map({
        container: mapNode.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [-81.1, 33.7],
        zoom: 5,
        pitch: 24,
        maxPitch: 85,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "bottom-right");
      map.addControl(new maplibre.AttributionControl({ compact: true, customAttribution: "Private 1CG CRM" }), "bottom-left");
      map.on("load", () => {
        addBuildings(map);
        map.fitBounds(bounds, { padding: 60, pitch: 24, bearing: 0, duration: 0 });
      });

      mappedProjects.forEach((project) => {
        const button = document.createElement("button");
        const pin = document.createElement("span");
        const dot = document.createElement("span");
        button.type = "button";
        button.className = "project-map-marker portal-project-map-marker";
        button.setAttribute("aria-label", `Open ${project.name}`);
        pin.className = "project-map-marker-pin";
        pin.append(dot);
        button.append(pin);
        button.addEventListener("click", () => {
          setSelectedId(project.id);
          map.flyTo({
            center: [project.longitude as number, project.latitude as number],
            zoom: 16.8,
            pitch: 68,
            bearing: -18,
            duration: 1200,
            essential: true,
          });
        });
        markersRef.current.push(
          new maplibre.Marker({ element: button, anchor: "bottom" })
            .setLngLat([project.longitude as number, project.latitude as number])
            .addTo(map),
        );
      });
    }
    void initialize();
    return () => {
      mounted = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mappedProjects]);

  function focus(project: PortalProject) {
    setSelectedId(project.id);
    if (project.longitude == null || project.latitude == null) return;
    mapRef.current?.flyTo({
      center: [project.longitude, project.latitude],
      zoom: 16.8,
      pitch: 68,
      bearing: -18,
      duration: 1200,
      essential: true,
    });
  }

  return (
    <section className="grid min-h-[680px] overflow-hidden border border-zinc-200 bg-white xl:grid-cols-[minmax(0,1.5fr)_430px]">
      <div className="relative min-h-[520px] bg-zinc-100">
        <div ref={mapNode} className="absolute inset-0" />
        <button
          type="button"
          onClick={() => mapRef.current?.fitBounds(bounds, { padding: 60, pitch: 24, bearing: 0, duration: 900 })}
          className="absolute left-4 top-4 z-10 inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-xs font-medium shadow-lg"
        >
          <LocateFixed size={14} /> All projects
        </button>
        {selected ? (
          <div className="absolute bottom-4 left-4 z-10 max-w-sm border border-zinc-200 bg-white p-4 shadow-2xl">
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
        <div className="max-h-[680px] flex-1 overflow-y-auto divide-y divide-zinc-100">
          {visibleProjects.map((project) => (
            <button key={project.id} type="button" onClick={() => focus(project)} className={`grid w-full grid-cols-[88px_1fr] gap-4 p-4 text-left transition hover:bg-zinc-50 ${selectedId === project.id ? "bg-zinc-100" : ""}`}>
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
