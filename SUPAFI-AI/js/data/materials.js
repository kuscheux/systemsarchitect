/* ============================================================
   MAGNOLIA — design-assist material review library
   Review gallery only. No approvals, no selections, no signoff.
   Status for every option: "Design Assist / Pending Final Selection"
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

(function () {
  var LB = "https://lumabuilt.com/wp-content/uploads/2026/03/";

  MAG.materialAreas = [
    {
      key: "plank", title: "Wood-Grain Soffit Options",
      sysTag: "6\" Mosaic V-Plank", use: "Balcony soffits, canopy bands, entry underside",
      blurb: "Wood-look aluminum plank. The grain family below is representative — final selection is pending design assist.",
      options: [
        { id: "light-national-walnut", name: "Light National Walnut", hex: "#b58a5c", thumb: LB + "Light-National-Walnut_thumb.jpg" },
        { id: "american-walnut",       name: "American Walnut",       hex: "#9a6b42", thumb: LB + "American-Walnut_thumb.jpg" },
        { id: "reclaimed-oak",         name: "Reclaimed Oak",         hex: "#a08862", thumb: LB + "Reclaimed-Oak_thumb.jpg" },
        { id: "white-oak",             name: "White Oak",             hex: "#d3bd96", thumb: LB + "White-Oak_thumb.jpg" },
        { id: "amber-bamboo",          name: "Amber Bamboo",          hex: "#c49a5e", thumb: LB + "Amber-Bamboo_thumb.jpg" },
        { id: "weathered-teak",        name: "Weathered Teak",        hex: "#8f7f6a", thumb: LB + "Weathered-Teak_thumb.jpg" },
        { id: "dark-national-walnut",  name: "Dark National Walnut",  hex: "#6e4a2e", thumb: LB + "Dark-National-Walnut_thumb.jpg" },
        { id: "black-walnut",          name: "Black Walnut",          hex: "#4a3526", thumb: LB + "Black-Walnut_thumb.jpg" }
      ]
    },
    {
      key: "acm", title: "ACM Finish Options",
      sysTag: "Routed ACM panels", use: "Spandrels, column covers, penthouse crown",
      blurb: "Architectural metal panel finishes for the cladding scope. Shown for visual coordination with the glazing palette.",
      options: [
        { id: "graphite",       name: "Graphite",             hex: "#3f444a", thumb: LB + "Graphite_thumb-1.jpg" },
        { id: "charcoal",       name: "Charcoal",             hex: "#2e3236", thumb: LB + "Charcoal_thumb.jpg" },
        { id: "pewter",         name: "Pewter MI-2117",       hex: "#8a8d90", thumb: LB + "MI-2117-Pewter-Borderless-2.jpg" },
        { id: "silver",         name: "Silver MI-2002",       hex: "#c3c6c9", thumb: LB + "MI-2002-Silver-Borderless-2-2.jpg" },
        { id: "bone-white",     name: "Bone White SL-1824",   hex: "#ece7da", thumb: LB + "SL-1824-Bone-White-Borderless-2.jpg" },
        { id: "dark-bronze",    name: "Dark Bronze SL-1050",  hex: "#453626", thumb: LB + "SL-1050-Dark-Bronze-Borderless-2.jpg" }
      ]
    },
    {
      key: "screen", title: "Garage Screening Finish",
      sysTag: "Perforated metal", use: "Parking levels 2–4 — south + east faces",
      blurb: "Perforated panel finish + openness ratio coordinated with ventilation and wind-load engineering.",
      options: [
        { id: "scr-graphite",   name: "Graphite Perf",      hex: "#3f444a", perf: true },
        { id: "scr-sage",       name: "Sage Green Perf",    hex: "#56645a", perf: true },
        { id: "scr-pewter",     name: "Pewter Perf",        hex: "#8a8d90", perf: true },
        { id: "scr-bronze",     name: "Dark Bronze Perf",   hex: "#453626", perf: true }
      ]
    },
    {
      key: "glass", title: "Glass / Spandrel Appearance",
      sysTag: "ES-7525 / GW-7000", use: "Vision glass + shadow-box spandrel appearance",
      blurb: "Vision and spandrel appearance families for coordination with ES Windows. Performance make-ups per specification.",
      options: [
        { id: "gl-clear",   name: "Clear Low-E",        hex: "#c8dcda", glass: true },
        { id: "gl-green",   name: "Green-Blue Low-E",   hex: "#9fc4bc", glass: true },
        { id: "gl-gray",    name: "Neutral Gray",       hex: "#aab6b8", glass: true },
        { id: "gl-spandrel",name: "Shadow-Box Spandrel",hex: "#46504b", glass: true }
      ]
    }
  ];

  MAG.materialStatus = "Design Assist / Pending Final Selection";
})();
