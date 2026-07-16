"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
} from "maplibre-gl";
import type { PresentationAppearance } from "@/data/pursuits/types";

export type MapCameraPreset = "southeast" | "charlotte" | "charleston";

export type MappableProject = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  kind?: "project" | "office";
  status?: "pending" | "complete";
};

export type ProjectMapCoreHandle = {
  fitPreset: (preset?: MapCameraPreset) => void;
  flyToLocation: (id: string) => void;
  resize: () => void;
};

type ProjectMapCoreProps = {
  locations: MappableProject[];
  selectedId?: string | null;
  highlightedId?: string | null;
  onSelect?: (id: string) => void;
  onHighlight?: (id: string | null) => void;
  cameraPreset: MapCameraPreset;
  appearance: PresentationAppearance;
  mode: "public-explorer" | "presentation";
  showBuildings?: boolean;
  showControls?: boolean;
  reducedMotion?: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  routeCoordinates?: [number, number][];
  routeProgress?: number;
  className?: string;
};

const STYLE_URLS: Record<PresentationAppearance, string> = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

const SOUTHEAST_BOUNDS: [[number, number], [number, number]] = [
  [-87.25, 29.65],
  [-77.15, 36.65],
];

const CAMERA_PRESETS = {
  charlotte: {
    center: [-80.8504, 35.2207] as [number, number],
    zoom: 14.1,
    pitch: 70,
    bearing: -18,
  },
  charleston: {
    center: [-79.9425, 32.7928] as [number, number],
    zoom: 13.7,
    pitch: 64,
    bearing: -22,
  },
};

function addBuildingExtrusions(
  map: MapLibreMap,
  appearance: PresentationAppearance,
) {
  if (map.getLayer("1cg-3d-buildings")) return;
  const labelLayer = map
    .getStyle()
    .layers?.find(
      (layer) => layer.type === "symbol" && layer.layout?.["text-field"],
    );

  map.addLayer(
    {
      id: "1cg-3d-buildings",
      source: "openmaptiles",
      "source-layer": "building",
      type: "fill-extrusion",
      minzoom: 12.5,
      paint: {
        "fill-extrusion-color": appearance === "dark" ? "#30343a" : "#c8ccce",
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
        "fill-extrusion-opacity": appearance === "dark" ? 0.82 : 0.9,
      },
    },
    labelLayer?.id,
  );
}

const ROUTE_FULL_SOURCE = "1cg-route-full";
const ROUTE_PROGRESS_SOURCE = "1cg-route-progress";
const ROUTE_HEAD_SOURCE = "1cg-route-head";

function lineFeature(coordinates: [number, number][]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates,
    },
  };
}

function headFeature(coordinate: [number, number] | null) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Point" as const,
      coordinates: coordinate ?? ([0, 0] as [number, number]),
    },
  };
}

function progressCoordinates(
  coordinates: [number, number][],
  progress: number,
) {
  if (coordinates.length < 2) return coordinates;
  const clamped = Math.max(0, Math.min(1, progress));
  const position = clamped * (coordinates.length - 1);
  const index = Math.min(coordinates.length - 2, Math.floor(position));
  const fraction = position - index;
  const start = coordinates[index];
  const end = coordinates[index + 1];
  const head: [number, number] = [
    start[0] + (end[0] - start[0]) * fraction,
    start[1] + (end[1] - start[1]) * fraction,
  ];
  return [...coordinates.slice(0, index + 1), head];
}

function ensureRouteLayers(
  map: MapLibreMap,
  appearance: PresentationAppearance,
) {
  if (!map.getSource(ROUTE_FULL_SOURCE)) {
    map.addSource(ROUTE_FULL_SOURCE, {
      type: "geojson",
      data: lineFeature([]),
    });
  }
  if (!map.getSource(ROUTE_PROGRESS_SOURCE)) {
    map.addSource(ROUTE_PROGRESS_SOURCE, {
      type: "geojson",
      data: lineFeature([]),
    });
  }
  if (!map.getSource(ROUTE_HEAD_SOURCE)) {
    map.addSource(ROUTE_HEAD_SOURCE, {
      type: "geojson",
      data: headFeature(null),
    });
  }

  if (!map.getLayer("1cg-route-base")) {
    map.addLayer({
      id: "1cg-route-base",
      type: "line",
      source: ROUTE_FULL_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": appearance === "dark" ? "#ffffff" : "#111111",
        "line-width": 2,
        "line-opacity": 0.2,
      },
    });
  }
  if (!map.getLayer("1cg-route-glow")) {
    map.addLayer({
      id: "1cg-route-glow",
      type: "line",
      source: ROUTE_PROGRESS_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#ff2638",
        "line-width": 14,
        "line-opacity": 0.34,
        "line-blur": 9,
      },
    });
  }
  if (!map.getLayer("1cg-route-line")) {
    map.addLayer({
      id: "1cg-route-line",
      type: "line",
      source: ROUTE_PROGRESS_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#f20d2f",
        "line-width": 4,
        "line-opacity": 0.96,
      },
    });
  }
  if (!map.getLayer("1cg-route-head-glow")) {
    map.addLayer({
      id: "1cg-route-head-glow",
      type: "circle",
      source: ROUTE_HEAD_SOURCE,
      paint: {
        "circle-radius": 20,
        "circle-color": "#ff2638",
        "circle-opacity": 0.42,
        "circle-blur": 0.72,
      },
    });
  }
  if (!map.getLayer("1cg-route-head")) {
    map.addLayer({
      id: "1cg-route-head",
      type: "circle",
      source: ROUTE_HEAD_SOURCE,
      paint: {
        "circle-radius": 7,
        "circle-color": "#ffffff",
        "circle-stroke-color": "#f20d2f",
        "circle-stroke-width": 4,
      },
    });
  }
}

function updateRoute(
  map: MapLibreMap,
  coordinates: [number, number][],
  progress: number,
) {
  ensureRouteLayers(map, "dark");
  const visibleCoordinates = progressCoordinates(coordinates, progress);
  (map.getSource(ROUTE_FULL_SOURCE) as GeoJSONSource | undefined)?.setData(
    lineFeature(coordinates),
  );
  (map.getSource(ROUTE_PROGRESS_SOURCE) as GeoJSONSource | undefined)?.setData(
    lineFeature(visibleCoordinates),
  );
  (map.getSource(ROUTE_HEAD_SOURCE) as GeoJSONSource | undefined)?.setData(
    headFeature(visibleCoordinates.at(-1) ?? null),
  );
}

export const ProjectMapCore = forwardRef<
  ProjectMapCoreHandle,
  ProjectMapCoreProps
>(function ProjectMapCore(
  {
    locations,
    selectedId,
    highlightedId,
    onSelect,
    onHighlight,
    cameraPreset,
    appearance,
    mode,
    showBuildings = true,
    showControls = true,
    reducedMotion = false,
    onInteractionStart,
    onInteractionEnd,
    routeCoordinates = [],
    routeProgress = 0,
    className = "h-full w-full",
  },
  forwardedRef,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, MapLibreMarker>>({});
  const appearanceRef = useRef(appearance);
  const locationsRef = useRef(locations);
  const onSelectRef = useRef(onSelect);
  const onHighlightRef = useRef(onHighlight);
  const onInteractionStartRef = useRef(onInteractionStart);
  const onInteractionEndRef = useRef(onInteractionEnd);
  const selectedCameraIdRef = useRef<string | null>(null);
  const routeCoordinatesRef = useRef(routeCoordinates);
  const routeProgressRef = useRef(routeProgress);
  const [ready, setReady] = useState(false);

  locationsRef.current = locations;
  onSelectRef.current = onSelect;
  onHighlightRef.current = onHighlight;
  onInteractionStartRef.current = onInteractionStart;
  onInteractionEndRef.current = onInteractionEnd;
  routeCoordinatesRef.current = routeCoordinates;
  routeProgressRef.current = routeProgress;

  const fitPreset = useCallback(
    (preset: MapCameraPreset = cameraPreset) => {
      const map = mapRef.current;
      if (!map) return;
      if (preset === "southeast") {
        map.fitBounds(SOUTHEAST_BOUNDS, {
          padding: mode === "presentation" ? 80 : 52,
          pitch: 24,
          bearing: 0,
          duration: 1100,
          essential: true,
        });
        return;
      }
      if (preset === "charleston" && mode === "presentation") {
        const points = locationsRef.current;
        if (points.length) {
          const longitudes = points.map((point) => point.longitude);
          const latitudes = points.map((point) => point.latitude);
          map.fitBounds(
            [
              [Math.min(...longitudes), Math.min(...latitudes)],
              [Math.max(...longitudes), Math.max(...latitudes)],
            ],
            {
              padding: 72,
              pitch: 46,
              bearing: -12,
              duration: 1100,
              essential: true,
            },
          );
          return;
        }
      }
      map.flyTo({
        ...CAMERA_PRESETS[preset],
        duration: 1100,
        essential: true,
      });
    },
    [cameraPreset, mode],
  );

  const flyToLocation = useCallback((id: string) => {
    const location = locationsRef.current.find((item) => item.id === id);
    if (!location || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: mode === "presentation" ? 16.4 : 17.15,
      pitch: mode === "presentation" ? 66 : 68,
      bearing: -20,
      duration: 1250,
      essential: true,
    });
  }, [mode]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      fitPreset,
      flyToLocation,
      resize: () => mapRef.current?.resize(),
    }),
    [fitPreset, flyToLocation],
  );

  useEffect(() => {
    let mounted = true;
    async function initialize() {
      if (!containerRef.current || mapRef.current) return;
      const maplibre = await import("maplibre-gl");
      if (!mounted || !containerRef.current) return;

      const initialCamera =
        cameraPreset === "southeast"
          ? CAMERA_PRESETS.charlotte
          : CAMERA_PRESETS[cameraPreset];
      const map = new maplibre.Map({
        container: containerRef.current,
        style: STYLE_URLS[appearanceRef.current],
        ...initialCamera,
        minZoom: 4,
        maxZoom: 19,
        maxPitch: 85,
        attributionControl: false,
      });
      mapRef.current = map;
      if (showControls) {
        map.addControl(
          new maplibre.NavigationControl({ visualizePitch: true }),
          "bottom-right",
        );
      }
      map.addControl(
        new maplibre.AttributionControl({
          compact: true,
          customAttribution: "1CG project locations",
        }),
        "bottom-left",
      );

      const configureStyle = () => {
        if (showBuildings) addBuildingExtrusions(map, appearanceRef.current);
        if (routeCoordinatesRef.current.length > 1) {
          ensureRouteLayers(map, appearanceRef.current);
          updateRoute(
            map,
            routeCoordinatesRef.current,
            routeProgressRef.current,
          );
        }
        map.setLight({
          anchor: "viewport",
          color: appearanceRef.current === "dark" ? "#b9c2cc" : "#ffffff",
          intensity: appearanceRef.current === "dark" ? 0.24 : 0.42,
        });
      };
      map.on("style.load", configureStyle);
      map.on("dragstart", () => onInteractionStartRef.current?.());
      map.on("dragend", () => onInteractionEndRef.current?.());
      map.on("rotatestart", (event) => {
        if (event.originalEvent) onInteractionStartRef.current?.();
      });
      map.on("rotateend", () => onInteractionEndRef.current?.());
      map.on("pitchstart", (event) => {
        if (event.originalEvent) onInteractionStartRef.current?.();
      });
      map.on("pitchend", () => onInteractionEndRef.current?.());
      map.on("load", () => {
        configureStyle();
        fitPreset(cameraPreset);
        setReady(true);
      });
    }

    void initialize();
    return () => {
      mounted = false;
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [cameraPreset, fitPreset, showBuildings, showControls]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    void import("maplibre-gl").then((maplibre) => {
      locations.forEach((location) => {
        const button = document.createElement("button");
        const pin = document.createElement("span");
        const dot = document.createElement("span");
        const label = document.createElement("span");
        button.type = "button";
        button.className = `project-map-marker${
          location.kind === "office" ? " office-map-marker" : ""
        }${location.status === "pending" ? " pending-map-marker" : ""}`;
        button.setAttribute(
          "aria-label",
          `View ${location.name}${location.status === "pending" ? ", pending" : ""}`,
        );
        pin.className = "project-map-marker-pin";
        label.className = "project-map-marker-label";
        label.textContent = `${location.name}${location.status === "pending" ? " · Pending" : ""}`;
        pin.append(dot);
        button.append(pin, label);
        button.addEventListener("mouseenter", () =>
          onHighlightRef.current?.(location.id),
        );
        button.addEventListener("mouseleave", () =>
          onHighlightRef.current?.(null),
        );
        button.addEventListener("focus", () =>
          onHighlightRef.current?.(location.id),
        );
        button.addEventListener("blur", () => onHighlightRef.current?.(null));
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current?.(location.id);
        });
        const marker = new maplibre.Marker({ element: button, anchor: "bottom" })
          .setLngLat([location.longitude, location.latitude])
          .addTo(map);
        markersRef.current[location.id] = marker;
      });
    });
  }, [locations, ready]);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.getElement().classList.toggle("is-active", id === selectedId);
      marker.getElement().classList.toggle("is-highlighted", id === highlightedId);
    });
  }, [highlightedId, selectedId]);

  useEffect(() => {
    if (!ready || mode !== "presentation" || !selectedId) return;
    if (selectedCameraIdRef.current === selectedId) return;
    selectedCameraIdRef.current = selectedId;
    const location = locationsRef.current.find((item) => item.id === selectedId);
    if (!location || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 16.4,
      pitch: 66,
      bearing: -20,
      duration: reducedMotion ? 0 : 1100,
      essential: !reducedMotion,
    });
  }, [mode, ready, reducedMotion, selectedId]);

  useEffect(() => {
    if (!ready || appearanceRef.current === appearance) return;
    appearanceRef.current = appearance;
    mapRef.current?.setStyle(STYLE_URLS[appearance]);
  }, [appearance, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current || routeCoordinates.length < 2) return;
    updateRoute(mapRef.current, routeCoordinates, routeProgress);
  }, [ready, routeCoordinates, routeProgress]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className={`${className} real-map`}
        data-map-mode={mode}
        data-map-appearance={appearance}
      />
      {!ready ? (
        <div
          className={`absolute inset-0 grid place-items-center text-sm ${
            appearance === "dark"
              ? "bg-[#101216] text-white/54"
              : "bg-[#e7ebed] text-black/52"
          }`}
        >
          Loading project map...
        </div>
      ) : null}
    </div>
  );
});
