/* ============================================================
   SUPAFI-AI · map.js
   Same living map as the 1CG site — OpenFreeMap positron,
   3D building extrusions, delivered-work pins for context,
   and Magnolia dropped as a pulsing PENDING pin you can
   run the whole deal from.
   ============================================================ */

(function () {
  let map = null, ready = false, queued = null;

  function addExtrusions() {
    if (map.getLayer("supafi-3d")) return;
    const label = map.getStyle().layers?.find(l => l.type === "symbol" && l.layout?.["text-field"]);
    map.addLayer({
      id: "supafi-3d", source: "openmaptiles", "source-layer": "building",
      type: "fill-extrusion", minzoom: 12.5,
      paint: {
        "fill-extrusion-color": ["interpolate", ["linear"],
          ["case", ["!=", ["get", "render_height"], null], ["to-number", ["get", "render_height"]],
            ["!=", ["get", "height"], null], ["to-number", ["get", "height"]], 8],
          0, "#ecece8", 70, "#c7cbcd", 180, "#9ca3a6"],
        "fill-extrusion-height": ["case", ["!=", ["get", "render_height"], null], ["to-number", ["get", "render_height"]],
          ["!=", ["get", "height"], null], ["to-number", ["get", "height"]], 8],
        "fill-extrusion-opacity": 0.93,
      },
    }, label?.id);
  }

  function pin(className, html) {
    const d = document.createElement("div");
    d.className = className; d.innerHTML = html || "";
    return d;
  }

  window.SupafiMap = {
    init(container, onMagnolia) {
      if (map || !window.maplibregl) return;
      map = new maplibregl.Map({
        container,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [-81.7, 33.5], zoom: 5.6, pitch: 18, bearing: 0,
        minZoom: 4, maxZoom: 19, maxPitch: 85, attributionControl: false,
      });
      map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: "SUPAFI-AI · 1CG field intelligence" }), "bottom-left");
      map.on("load", () => {
        addExtrusions(); ready = true;
        /* delivered portfolio — quiet dots */
        SUPAFI.PORTFOLIO.forEach(p => {
          const m = pin("pin-dot", "");
          m.title = p.name;
          new maplibregl.Marker({ element: m }).setLngLat(p.c)
            .setPopup(new maplibregl.Popup({ offset: 10, closeButton: false }).setHTML(`<div class="pop"><b>${p.name}</b><span>Delivered · ${p.city}</span></div>`))
            .addTo(map);
        });
        /* offices */
        SUPAFI.OFFICES.forEach(o => {
          const m = pin("pin-office", "");
          new maplibregl.Marker({ element: m }).setLngLat(o.c)
            .setPopup(new maplibregl.Popup({ offset: 10, closeButton: false }).setHTML(`<div class="pop"><b>${o.name}</b><span>1CG office</span></div>`))
            .addTo(map);
        });
        /* Magnolia — the pending star of the show */
        const mag = pin("pin-magnolia", `<span class="pin-pulse"></span><span class="pin-core"></span><span class="pin-tag">MAGNOLIA · PENDING</span>`);
        mag.addEventListener("click", (e) => onMagnolia && onMagnolia(e));
        new maplibregl.Marker({ element: mag, anchor: "bottom" }).setLngLat(SUPAFI.MAGNOLIA.coordinates).addTo(map);
        if (queued) { queued(); queued = null; }
      });
    },
    overview() {
      const go = () => map.fitBounds([[-87.25, 29.65], [-77.15, 36.65]], { padding: 60, pitch: 20, bearing: 0, duration: 1600 });
      ready ? go() : (queued = go);
    },
    flyToMagnolia() {
      const go = () => map.flyTo({ center: SUPAFI.MAGNOLIA.coordinates, zoom: 15.6, pitch: 66, bearing: -24, duration: 2600, essential: true });
      ready ? go() : (queued = go);
    },
    resize() { map && map.resize(); },
  };
})();
