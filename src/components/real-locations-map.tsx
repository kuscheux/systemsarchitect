"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Expand,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import type { Project } from "@/data/projects";
import { getProjectLocation } from "@/data/project-locations";
import { MobileProjectExplorer } from "@/components/mobile-project-explorer";

const SOUTHEAST_BOUNDS: [[number, number], [number, number]] = [
  [-87.25, 29.65],
  [-77.15, 36.65],
];

const CHARLOTTE_CAMERA = {
  center: [-80.8504, 35.2207] as [number, number],
  zoom: 14.1,
  pitch: 70,
  bearing: -18,
};

const officeLocations = [
  {
    name: "Charlotte HQ + Fabrication",
    label: "Charlotte / Indian Trail",
    address: "620 Radiator Road, Building 4, Indian Trail, NC 28079",
    coordinates: [-80.651427, 35.0619522] as [number, number],
  },
  {
    name: "Charleston Office",
    label: "Charleston",
    address: "62 Brigade Street, Charleston, SC 29403",
    coordinates: [-79.9462934, 32.8116787] as [number, number],
  },
  {
    name: "Atlanta Office",
    label: "Atlanta",
    address: "4830 Fulton Industrial Blvd. SW, Atlanta, GA 30336",
    coordinates: [-84.5442718, 33.755313] as [number, number],
  },
].map((office) => ({
  ...office,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(office.address)}`,
}));

function addBuildingExtrusions(map: MapLibreMap) {
  if (map.getLayer("1cg-3d-buildings")) return;

  const labelLayer = map
    .getStyle()
    .layers?.find((layer) => layer.type === "symbol" && layer.layout?.["text-field"]);

  map.addLayer(
    {
      id: "1cg-3d-buildings",
      source: "openmaptiles",
      "source-layer": "building",
      type: "fill-extrusion",
      minzoom: 12.5,
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          [
            "case",
            ["!=", ["get", "render_height"], null],
            ["to-number", ["get", "render_height"]],
            ["!=", ["get", "height"], null],
            ["to-number", ["get", "height"]],
            8,
          ],
          0,
          "#ecece8",
          70,
          "#c7cbcd",
          180,
          "#9ca3a6",
        ],
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
          ["!=", ["get", "min_height"], null],
          ["to-number", ["get", "min_height"]],
          0,
        ],
        "fill-extrusion-opacity": 0.93,
      },
    },
    labelLayer?.id,
  );
}

export function RealLocationsMap({ projects }: { projects: Project[] }) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRefs = useRef<Record<string, MapLibreMarker>>({});
  const projectRowRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const expandButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedProjectSlug) ?? null,
    [projects, selectedProjectSlug],
  );

  const visibleProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((project) =>
      [project.name, project.market, project.location, project.region]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [projects, query]);

  const showSoutheast = useCallback(() => {
    mapRef.current?.fitBounds(SOUTHEAST_BOUNDS, {
      padding: isExpanded ? 70 : 45,
      pitch: 24,
      bearing: 0,
      duration: 1300,
    });
    setSelectedOffice(null);
    setSelectedProjectSlug(null);
  }, [isExpanded]);

  const focusProject = useCallback((project: Project, openExplorer = true) => {
    const location = getProjectLocation(project.slug);
    setSelectedProjectSlug(project.slug);
    setSelectedOffice(null);
    if (openExplorer) setIsExpanded(true);
    mapRef.current?.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 17.15,
      pitch: 68,
      bearing: -20,
      duration: 1500,
      essential: true,
    });
    window.setTimeout(() => {
      projectRowRefs.current[project.slug]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 250);
  }, []);

  const closeExplorer = useCallback(() => {
    setIsExpanded(false);
    window.setTimeout(() => expandButtonRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    let mounted = true;
    const markers: MapLibreMarker[] = [];

    async function initializeMap() {
      if (!mapElementRef.current || mapRef.current) return;
      const maplibre = await import("maplibre-gl");
      if (!mounted || !mapElementRef.current) return;

      const map = new maplibre.Map({
        container: mapElementRef.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        ...CHARLOTTE_CAMERA,
        minZoom: 4,
        maxZoom: 19,
        maxPitch: 85,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "bottom-right");
      map.addControl(
        new maplibre.AttributionControl({ compact: true, customAttribution: "1CG project locations" }),
        "bottom-left",
      );

      const syncCameraState = () => {
        if (mapElementRef.current) {
          mapElementRef.current.dataset.mapZoom = map.getZoom().toFixed(2);
          mapElementRef.current.dataset.mapPitch = map.getPitch().toFixed(1);
          mapElementRef.current.dataset.mapBearing = map.getBearing().toFixed(1);
        }
      };
      const syncLabelVisibility = () => {
        const showLabels = map.getZoom() >= 10.4;
        Object.values(markerRefs.current).forEach((marker) => {
          marker.getElement().classList.toggle("show-label", showLabels);
        });
      };

      map.on("load", () => {
        addBuildingExtrusions(map);
        map.setLight({ anchor: "viewport", color: "#ffffff", intensity: 0.42 });
        map.setSky({
          "sky-color": "#82b9d8",
          "horizon-color": "#f8faf9",
          "fog-color": "#edf1f2",
          "sky-horizon-blend": 0.42,
          "horizon-fog-blend": 0.72,
          "fog-ground-blend": 0.68,
          "atmosphere-blend": 0.82,
        });
        map.jumpTo(CHARLOTTE_CAMERA);
        setIsMapReady(true);
        syncCameraState();
        syncLabelVisibility();
      });
      map.on("move", syncCameraState);
      map.on("zoomend", syncLabelVisibility);

      projects.forEach((project) => {
        const location = getProjectLocation(project.slug);
        const markerButton = document.createElement("button");
        const markerPin = document.createElement("span");
        const markerDot = document.createElement("span");
        const markerLabel = document.createElement("span");
        markerButton.type = "button";
        markerButton.className = "project-map-marker";
        markerButton.setAttribute("aria-label", `View ${project.name}`);
        markerPin.className = "project-map-marker-pin";
        markerLabel.className = "project-map-marker-label";
        markerLabel.textContent = project.name;
        markerPin.append(markerDot);
        markerButton.append(markerPin, markerLabel);
        markerButton.addEventListener("click", (event) => {
          event.stopPropagation();
          focusProject(project);
        });
        const marker = new maplibre.Marker({ element: markerButton, anchor: "bottom" })
          .setLngLat([location.longitude, location.latitude])
          .addTo(map);
        markerRefs.current[project.slug] = marker;
        markers.push(marker);
      });

      officeLocations.forEach((office, index) => {
        const markerButton = document.createElement("button");
        const markerPin = document.createElement("span");
        const markerDot = document.createElement("span");
        const markerLabel = document.createElement("span");
        markerButton.type = "button";
        markerButton.className = "project-map-marker office-map-marker";
        markerButton.setAttribute("aria-label", `View ${office.name}`);
        markerPin.className = "project-map-marker-pin";
        markerLabel.className = "project-map-marker-label";
        markerLabel.textContent = office.name;
        markerPin.append(markerDot);
        markerButton.append(markerPin, markerLabel);
        markerButton.addEventListener("click", (event) => {
          event.stopPropagation();
          setSelectedOffice(index);
          setSelectedProjectSlug(null);
          setIsExpanded(true);
          map.flyTo({ center: office.coordinates, zoom: 16.4, pitch: 60, bearing: -18, duration: 1400 });
        });
        const marker = new maplibre.Marker({ element: markerButton, anchor: "bottom" })
          .setLngLat(office.coordinates)
          .addTo(map);
        markers.push(marker);
      });
    }

    void initializeMap();
    return () => {
      mounted = false;
      markers.forEach((marker) => marker.remove());
      markerRefs.current = {};
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [focusProject, projects]);

  useEffect(() => {
    const timer = window.setTimeout(() => mapRef.current?.resize(), 80);
    if (!isExpanded) return () => window.clearTimeout(timer);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeExplorer();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => mapRef.current?.resize(), 80);
    };
  }, [closeExplorer, isExpanded]);

  const selectedOfficeData = selectedOffice === null ? null : officeLocations[selectedOffice];
  const selectedLocation = selectedProject ? getProjectLocation(selectedProject.slug) : null;

  return (
    <section id="locations" className="bg-background px-5 py-24 sm:px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <p className="public-eyebrow">Project Pins</p>
            <h2 className="public-section-title mt-4 max-w-3xl text-foreground">
              Every project has a place.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-muted lg:ml-auto">
            Open a pin for the project, photos, status, and directions. New pursuits can start
            here, then become live portfolio pages when the work is complete.
          </p>
        </div>

        <div
          role={isExpanded ? "dialog" : undefined}
          aria-modal={isExpanded || undefined}
          aria-label={isExpanded ? "1CG project location explorer" : undefined}
          className={
            isExpanded
              ? "fixed inset-0 z-[100] grid min-h-0 grid-rows-[minmax(0,1fr)_minmax(245px,43vh)] bg-background p-2 sm:p-3 lg:grid-cols-[minmax(0,1fr)_440px] lg:grid-rows-1 lg:gap-3"
              : "grid gap-5 lg:grid-cols-[1.45fr_0.55fr]"
          }
        >
          <div className={isExpanded ? "relative min-h-0 overflow-hidden border border-border bg-[#e7ebed]" : "template-card overflow-hidden p-3"}>
            <div
              className={
                isExpanded
                  ? "relative h-full min-h-0 overflow-hidden"
                  : "relative min-h-[600px] cursor-default overflow-hidden rounded-[1.25rem] border border-border bg-[#e7ebed] shadow-2xl shadow-black/10 md:min-h-[760px]"
              }
            >
              <div ref={mapElementRef} className={isExpanded ? "real-map h-full w-full" : "real-map h-[600px] w-full md:h-[760px]"} />
              {!isMapReady ? (
                <div className="absolute inset-0 grid place-items-center bg-[#e7ebed] text-sm text-muted">
                  Loading 3D project map...
                </div>
              ) : null}

              <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                <button type="button" onClick={showSoutheast} className="map-floating-control">
                  <LocateFixed size={15} /> All Locations
                </button>
                <button
                  type="button"
                  onClick={() => mapRef.current?.flyTo({ ...CHARLOTTE_CAMERA, duration: 1300 })}
                  className="map-floating-control hidden sm:inline-flex"
                >
                  <Building2 size={15} /> Charlotte 3D
                </button>
              </div>

              {!isExpanded ? (
                <button
                  ref={expandButtonRef}
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="absolute right-4 top-4 z-10 inline-flex h-11 items-center gap-2 rounded-full bg-black px-4 text-sm font-medium text-white shadow-xl"
                  aria-label="Expand 3D project map"
                >
                  <Expand size={16} /> Explore
                </button>
              ) : null}
            </div>
          </div>

          <aside className={isExpanded ? "relative min-h-0 overflow-hidden border border-border bg-white" : "grid gap-5"}>
            {isExpanded ? (
              <>
                <MobileProjectExplorer
                  key={selectedProjectSlug ?? "project-list"}
                  projects={visibleProjects}
                  selectedProject={selectedProject}
                  query={query}
                  onQueryChange={setQuery}
                  onSelect={(project) => focusProject(project, false)}
                  onClearSelection={() => setSelectedProjectSlug(null)}
                  onClose={closeExplorer}
                />
              <div className="hidden h-full min-h-0 flex-col lg:flex">
                <header className="border-b border-border p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="public-eyebrow">Project Explorer</p>
                      <h3 className="public-card-title mt-2 text-foreground">
                        {selectedOfficeData?.name || selectedProject?.name || "All Southeast Projects"}
                      </h3>
                    </div>
                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={closeExplorer}
                      className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground"
                      aria-label="Close project map"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {selectedProject && selectedLocation ? (
                    <div className="mt-4 grid grid-cols-[96px_1fr] gap-3">
                      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                        <Image src={selectedProject.image} alt="" fill sizes="96px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs leading-5 text-muted">{selectedProject.market} · {selectedProject.location}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{selectedLocation.address}</p>
                        <div className="mt-2 flex gap-3">
                          <Link href={`/projects/${selectedProject.slug}`} className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                            View Project <ArrowUpRight size={13} />
                          </Link>
                          <Link href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                            Directions <Navigation size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : selectedOfficeData ? (
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <p className="max-w-xs text-xs leading-5 text-muted">{selectedOfficeData.address}</p>
                      <Link href={selectedOfficeData.directions} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-foreground">
                        Directions <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  ) : null}

                  <label className="mt-4 flex h-10 items-center gap-2 border border-border bg-background px-3 text-muted">
                    <Search size={15} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search all 72 projects"
                      className="w-full bg-transparent text-xs text-foreground outline-none"
                    />
                  </label>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="divide-y divide-border">
                    {visibleProjects.map((project) => (
                      <Link
                        ref={(node) => { projectRowRefs.current[project.slug] = node; }}
                        key={project.slug}
                        href={`/projects/${project.slug}`}
                        onMouseEnter={() => setSelectedProjectSlug(project.slug)}
                        className={`group grid grid-cols-[92px_1fr_auto] items-center gap-3 p-3 transition sm:grid-cols-[112px_1fr_auto] sm:p-4 ${selectedProjectSlug === project.slug ? "bg-secondary" : "hover:bg-secondary/70"}`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                          <Image src={project.image} alt="" fill sizes="112px" className="object-cover transition duration-500 group-hover:scale-105" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="public-card-title truncate text-sm text-foreground">{project.name}</h4>
                          <p className="mt-1 truncate text-[11px] text-muted">{project.market} · {project.location}</p>
                        </div>
                        <MapPin size={15} className="text-muted transition group-hover:text-foreground" />
                      </Link>
                    ))}
                    {visibleProjects.length === 0 ? <p className="p-6 text-sm text-muted">No projects match this search.</p> : null}
                  </div>
                </div>
              </div>
              </>
            ) : (
              <>
                <article className="template-card p-5">
                  <p className="public-eyebrow">Project Pins</p>
                  <h3 className="public-card-title mt-3 text-foreground">{projects.length} Projects / 19 Locations</h3>
                  <p className="mt-4 text-sm leading-6 text-muted">
                    Each pin can hold project media, context, directions, and a finished case study.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setIsExpanded(true)} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
                      Explore Map <Expand size={15} />
                    </button>
                    <Link href="/project-pins" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground">
                      View Feature <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
                {officeLocations.map((office, index) => (
                  <article key={office.name} className="template-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="public-eyebrow">0{index + 1} / {office.label}</p>
                        <h3 className="public-card-title mt-3 text-foreground">{office.name}</h3>
                      </div>
                      <MapPin size={20} className="mt-1 text-muted" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted">{office.address}</p>
                    <Link href={office.directions} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
                      <Navigation size={15} /> Get Directions <ArrowUpRight size={15} />
                    </Link>
                  </article>
                ))}
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
