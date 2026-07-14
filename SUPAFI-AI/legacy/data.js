/* ============================================================
   SUPAFI-AI · data.js
   Single source of truth extracted from the Magnolia elevation
   drawings (A5-series). Drives blueprints, 3D model, takeoff,
   scope tables and CRM seed. Quantities are auto-extracted —
   verify before bid day.
   ============================================================ */

var SUPAFI = window.SUPAFI = window.SUPAFI || {};

SUPAFI.BRAND = {
  name: "SUPAFI-AI",
  tagline: "Subcontractors' Unified Platform Advancing Field Intelligence",
  company: "1CG · Glazing & Cladding",
};

/* ---------- Levels (from elevation datum, EL in feet) ---------- */
/* rel = height above Level 1 finished floor (EL 15'-6") */
SUPAFI.LEVELS = [
  { id: "P1",  name: "Level P1 — Parking",      el: 14.5,  rel: -1.0 },
  { id: "L1",  name: "Level 1 — Lobby / Retail", el: 15.5,  rel: 0 },
  { id: "L2P", name: "Level 2 — Parking",        el: 26.5,  rel: 11.0 },
  { id: "L2O", name: "Level 2 — Office",         el: 32.5,  rel: 17.0 },
  { id: "L3P", name: "Level 3 — Parking",        el: 36.5,  rel: 21.0 },
  { id: "L4P", name: "Level 4 — Parking",        el: 46.5,  rel: 31.0 },
  { id: "L5",  name: "Level 5 — Office",         el: 60.0,  rel: 44.5 },
  { id: "L6",  name: "Level 6 — Office",         el: 73.5,  rel: 58.0 },
  { id: "L7",  name: "Level 7 — Office",         el: 87.0,  rel: 71.5 },
  { id: "L8",  name: "Level 8 — Roof",           el: 101.5, rel: 86.0 },
  { id: "L9",  name: "Level 9 — PH Roof",        el: 115.5, rel: 100.0 },
];

/* ---------- Column grid (feet, along the long elevation) ---------- */
SUPAFI.GRIDS = [
  { id: "B", x: 0 },
  { id: "C", x: 46.5 },
  { id: "D", x: 66.5 },
  { id: "E", x: 113.0 },
  { id: "F", x: 171.0 },
];
SUPAFI.OVERALL = { width: 171.0, towerWidth: 113.0, wingWidth: 58.0, depth: 70.0, height: 100.0 };

/* ---------- Facade systems + auto-extracted takeoff ---------- */
SUPAFI.SYSTEMS = {
  plank: {
    key: "plank", name: '6" Mosaic V Plank', vendor: "Lumabuilt",
    color: "#e8e400", finishable: true, defaultFinish: "american-walnut",
    note: "Woodgrain aluminum plank fascia bands",
  },
  screen: {
    key: "screen", name: "Perf Garage Screening", vendor: "Lumabuilt / custom perf",
    color: "#2fbfb2", finishable: true, defaultFinish: "charcoal",
    note: "Perforated aluminum screening at parking levels",
  },
  spandrel: {
    key: "spandrel", name: "ACM Spandrels & Trim", vendor: "Visage ACM",
    color: "#d21ee0", finishable: true, defaultFinish: "dark-bronze-sl1050",
    note: "Floor-line panel bands, column covers, canopies (scope highlight)",
  },
  glassSM: {
    key: "glassSM", name: "Curtain Wall — Small Missile", vendor: "Basis of design: ESWindows",
    color: "#9fc4e8", finishable: false,
    note: "Upper 56'-0\" glazing zone · small missile-rated",
  },
  glassLM: {
    key: "glassLM", name: "Storefront — Large Missile", vendor: "Basis of design: ESWindows",
    color: "#7ea8d4", finishable: false,
    note: "Lower 30'-0\" glazing zone · large missile-rated",
  },
  penthouse: {
    key: "penthouse", name: "Penthouse Standing Seam", vendor: "Lumaplate",
    color: "#c024c9", finishable: true, defaultFinish: "oil-rubbed-bronze",
    note: "Mechanical penthouse vertical seam cladding",
  },
};

/* Per-elevation extracted quantities (sf) */
SUPAFI.TAKEOFF = [
  { sys: "plank",  elev: "East",  items: [ { label: "93.2 sf band", sf: 93.2, qty: 6 }, { label: "116.7 sf band", sf: 116.7, qty: 2 }, { label: "17.5 sf accent", sf: 17.5, qty: 3 } ] },
  { sys: "plank",  elev: "West",  items: [ { label: "93.2 sf band", sf: 93.2, qty: 6 }, { label: "116.7 sf band", sf: 116.7, qty: 2 }, { label: "17.5 sf accent", sf: 17.5, qty: 3 } ] },
  { sys: "screen", elev: "East",  items: [ { label: "Perf screening", sf: 518.9, qty: 1 } ] },
  { sys: "screen", elev: "South — Garage", items: [ { label: "Perf screening", sf: 2498.3, qty: 1 }, { label: "Perf screening", sf: 1007.9, qty: 1 }, { label: "Perf screening", sf: 271.3, qty: 1 }, { label: "Perf screening", sf: 442.6, qty: 1 } ] },
  { sys: "glassSM", elev: "All", items: [ { label: "Estimated curtain wall", sf: 33800, qty: 1, est: true } ] },
  { sys: "glassLM", elev: "All", items: [ { label: "Estimated storefront", sf: 6900, qty: 1, est: true } ] },
];

SUPAFI.totalFor = (sysKey) =>
  SUPAFI.TAKEOFF.filter(t => t.sys === sysKey)
    .reduce((a, t) => a + t.items.reduce((b, i) => b + i.sf * i.qty, 0), 0);

/* ---------- Window / cladding type schedule ---------- */
SUPAFI.TYPES = [
  { tag: "CW-1", name: "Unitized curtain wall", rating: "Small missile", zone: "EL 45'→101' (upper 56')", bod: "ESWindows — confirm series", sysRef: "glassSM" },
  { tag: "WW-1", name: "Window wall + terrace doors", rating: "Small missile", zone: "Office levels 5–7 balconies", bod: "ESWindows — confirm series", sysRef: "glassSM" },
  { tag: "SF-1", name: "Storefront / entrances", rating: "Large missile", zone: "EL 15'→45' (lower 30')", bod: "ESWindows — confirm series", sysRef: "glassLM" },
  { tag: "MP-1", name: '6" Mosaic V Plank fascia', rating: "—", zone: "Balcony floor-line bands", bod: "Lumabuilt Mosaic Plank System", sysRef: "plank" },
  { tag: "PG-1", name: "Perforated garage screening", rating: "Wind-load engineered", zone: "Parking levels 2–4", bod: "Lumabuilt / custom perf", sysRef: "screen" },
  { tag: "SP-1", name: "ACM spandrel & column covers", rating: "—", zone: "All floor lines", bod: "Visage ACM sheets", sysRef: "spandrel" },
  { tag: "SS-1", name: "Penthouse standing seam", rating: "—", zone: "Mechanical penthouse", bod: "Lumaplate", sysRef: "penthouse" },
];

/* ---------- Lumabuilt finish library (lumabuilt.com/colors-finishes) ---------- */
const LB = "https://lumabuilt.com/wp-content/uploads/2026/03/";
SUPAFI.FINISHES = [
  /* Mosaic Woodgrains */
  { id: "white-american-walnut", name: "White American Walnut", group: "Woodgrains", v: "V3", hex: "#d9c6a8", thumb: LB + "White-American-Walnut_thumb.jpg" },
  { id: "light-american-walnut", name: "Light American Walnut", group: "Woodgrains", v: "V3", hex: "#c2a074", thumb: LB + "Light-American-Walnut_thumb.jpg" },
  { id: "american-walnut", name: "American Walnut", group: "Woodgrains", v: "V3", hex: "#9a6b42", thumb: LB + "American-Walnut_thumb.jpg" },
  { id: "light-national-walnut", name: "Light National Walnut", group: "Woodgrains", v: "V3", hex: "#b58a5c", thumb: LB + "Light-National-Walnut_thumb.jpg" },
  { id: "dark-national-walnut", name: "Dark National Walnut", group: "Woodgrains", v: "V3", hex: "#6e4a2e", thumb: LB + "Dark-National-Walnut_thumb.jpg" },
  { id: "light-table-walnut", name: "Light Table Walnut", group: "Woodgrains", v: "V3", hex: "#ad825a", thumb: LB + "Light-Table-Walnut_thumb.jpg" },
  { id: "table-walnut", name: "Table Walnut", group: "Woodgrains", v: "V3", hex: "#7d5636", thumb: LB + "Table-Walnut_thumb.jpg" },
  { id: "light-super-wide-grain", name: "Light Super Wide Grain", group: "Woodgrains", v: "V3", hex: "#c8a679", thumb: LB + "Light-Super-Wide-Grain_thumb.jpg" },
  { id: "super-wide-grain", name: "Super Wide Grain", group: "Woodgrains", v: "V3", hex: "#a37a4c", thumb: LB + "Super-Wide-Grain_thumb.jpg" },
  { id: "dark-super-wide-grain", name: "Dark Super Wide Grain", group: "Woodgrains", v: "V3", hex: "#67462b", thumb: LB + "Dark-Super-Wide-Grain_thumb.jpg" },
  { id: "medium-cherry", name: "Medium Cherry", group: "Woodgrains", v: "V3", hex: "#8e4f30", thumb: LB + "Medium-Cherry_thumb.jpg" },
  { id: "dark-cherry", name: "Dark Cherry", group: "Woodgrains", v: "V3", hex: "#6b3524", thumb: LB + "Dark-Cherry_thumb.jpg" },
  { id: "white-oak", name: "White Oak", group: "Woodgrains", v: "V2", hex: "#d3bd96", thumb: LB + "White-Oak_thumb.jpg" },
  { id: "reclaimed-oak", name: "Reclaimed Oak", group: "Woodgrains", v: "V3", hex: "#a08862", thumb: LB + "Reclaimed-Oak_thumb.jpg" },
  { id: "dark-super-oak", name: "Dark Super Oak", group: "Woodgrains", v: "V3", hex: "#5d4127", thumb: LB + "Dark-Super-Oak_thumb.jpg" },
  { id: "dark-knotty-pine", name: "Dark Knotty Pine", group: "Woodgrains", v: "V1", hex: "#7a5733", thumb: LB + "Dark-Knotty-Pine_thumb.jpg" },
  { id: "extra-dark-knotty-pine", name: "Extra Dark Knotty Pine", group: "Woodgrains", v: "V1", hex: "#503820", thumb: LB + "Extra-Dark-Knotty-Pine_thumb.jpg" },
  { id: "white-bamboo", name: "White Bamboo", group: "Woodgrains", v: "V1", hex: "#e2d3b3", thumb: LB + "White-Bamboo_thumb.jpg" },
  { id: "amber-bamboo", name: "Amber Bamboo", group: "Woodgrains", v: "V1", hex: "#c49a5e", thumb: LB + "Amber-Bamboo_thumb.jpg" },
  { id: "dark-amber-bamboo", name: "Dark Amber Bamboo", group: "Woodgrains", v: "V1", hex: "#96682f", thumb: LB + "Dark-Amber-Bamboo_thumb.jpg" },
  { id: "cream-fir", name: "Cream Fir", group: "Woodgrains", v: "V1", hex: "#e6d9bd", thumb: LB + "Cream-Fir_thumb.jpg" },
  { id: "light-fir", name: "Light Fir", group: "Woodgrains", v: "V1", hex: "#cdb289", thumb: LB + "Light-Fir_thumb.jpg" },
  { id: "dark-fir", name: "Dark Fir", group: "Woodgrains", v: "V1", hex: "#8c6a44", thumb: LB + "Dark-Fir_thumb.jpg" },
  { id: "light-maple", name: "Light Maple", group: "Woodgrains", v: "V3", hex: "#e0c9a2", thumb: LB + "Light-Maple_thumb.jpg" },
  { id: "light-pecan", name: "Light Pecan", group: "Woodgrains", v: "V2", hex: "#c9a878", thumb: LB + "Light-Pecan_thumb.jpg" },
  { id: "weathered-teak", name: "Weathered Teak", group: "Woodgrains", v: "V3", hex: "#8f7f6a", thumb: LB + "Weathered-Teak_thumb.jpg" },
  { id: "black-walnut", name: "Black Walnut", group: "Woodgrains", v: "V2", hex: "#4a3526", thumb: LB + "Black-Walnut_thumb.jpg" },
  /* Mosaic Solid Colors */
  { id: "black", name: "Black", group: "Solids", v: "", hex: "#101214", thumb: LB + "Black_thumb.jpg" },
  { id: "charcoal", name: "Charcoal", group: "Solids", v: "", hex: "#2e3236", thumb: LB + "Charcoal_thumb.jpg" },
  { id: "graphite", name: "Graphite", group: "Solids", v: "", hex: "#3f444a", thumb: LB + "Graphite_thumb-1.jpg" },
  { id: "serious-gray", name: "Serious Gray", group: "Solids", v: "", hex: "#6d7278", thumb: LB + "Serious-Gray_thumb.jpg" },
  { id: "signal-white", name: "Signal White", group: "Solids", v: "", hex: "#f2f3f1", thumb: LB + "Signal-White_thumb.jpg" },
  { id: "dark-bronze", name: "Dark Bronze", group: "Solids", v: "", hex: "#4a3a2c", thumb: LB + "Dark-Bronze_thumb.jpg" },
  { id: "oil-rubbed-bronze", name: "Oil Rubbed Bronze", group: "Solids", v: "", hex: "#3b2f26", thumb: LB + "Oil-Rubbed-Bronze_thumb.jpg" },
  { id: "weathering-steel", name: "Weathering Steel", group: "Solids", v: "", hex: "#7a4b30", thumb: LB + "Weathering-Steel_thumb.jpg" },
  { id: "rust-spice", name: "Rust Spice", group: "Solids", v: "", hex: "#96502e", thumb: LB + "Rust-Spice_thumb.jpg" },
  { id: "sierra-tan", name: "Sierra Tan", group: "Solids", v: "", hex: "#b08d5f", thumb: LB + "Sierra-Tan_thumb.jpg" },
  /* Visage ACM */
  { id: "silver-mi2002", name: "Silver MI-2002", group: "Visage ACM", v: "", hex: "#c3c6c9", thumb: LB + "MI-2002-Silver-Borderless-2-2.jpg" },
  { id: "bone-white-sl1824", name: "Bone White SL-1824", group: "Visage ACM", v: "", hex: "#ece7da", thumb: LB + "SL-1824-Bone-White-Borderless-2.jpg" },
  { id: "black-sl1012", name: "Black SL-1012", group: "Visage ACM", v: "", hex: "#131416", thumb: LB + "SL-1012-Black-Borderless.jpg" },
  { id: "dark-bronze-sl1050", name: "Dark Bronze SL-1050", group: "Visage ACM", v: "", hex: "#453626", thumb: LB + "SL-1050-Dark-Bronze-Borderless-2.jpg" },
  { id: "mouse-grey-sl1831", name: "Mouse Grey SL-1831", group: "Visage ACM", v: "V1", hex: "#9a9a96", thumb: LB + "SL-1831-Mouse-Grey-Borderless-2.jpg" },
  { id: "pewter-mi2117", name: "Pewter MI-2117", group: "Visage ACM", v: "", hex: "#8a8d90", thumb: LB + "MI-2117-Pewter-Borderless-2.jpg" },
];
SUPAFI.finishById = (id) => SUPAFI.FINISHES.find(f => f.id === id) || SUPAFI.FINISHES[2];

/* ---------- Project: Magnolia (pending) ---------- */
SUPAFI.MAGNOLIA = {
  slug: "magnolia",
  name: "Magnolia",
  status: "pending",
  probability: 0.55,
  market: "Mixed-use office over parking",
  location: "Magnolia District — Ashley Riverfront, Charleston, SC",
  coordinates: [-79.9722, 32.8462],
  package: "Glazing & Cladding — one company, one package",
  facts: [
    { k: "Overall width", v: "171'-0\" (grids B–F)" },
    { k: "Height", v: "100'-0\" (L1 → PH roof)" },
    { k: "Glazing zones", v: "Large missile 30' / Small missile 56'" },
    { k: "Levels", v: "9 incl. penthouse · office over parking" },
  ],
};

/* ---------- Pipeline / timeline stepper ---------- */
SUPAFI.PIPELINE = [
  { id: "intake", label: "Drawings Intake", done: true },
  { id: "takeoff", label: "AI Takeoff", done: true },
  { id: "model", label: "3D Model", done: true },
  { id: "materials", label: "Materials", done: false, active: true },
  { id: "scope", label: "Scope & Types", done: false },
  { id: "pending", label: "Pending Award", done: false, pending: true },
  { id: "awarded", label: "Awarded", done: false },
  { id: "field", label: "Field Ops", done: false },
];

/* ---------- CRM seed ---------- */
SUPAFI.CRM_SEED = {
  status: "pending",
  bidDue: "2026-08-14",
  value: 4850000,
  contacts: [
    { name: "Kyle Kusche", org: "1CG", role: "Preconstruction / PM", email: "kmkusche@gmail.com", phone: "—" },
    { name: "GC — TBD", org: "Awaiting award", role: "General Contractor", email: "—", phone: "—" },
    { name: "Architect — TBD", org: "Design team", role: "Architect of record", email: "—", phone: "—" },
  ],
  activity: [
    { t: Date.now() - 86400000 * 3, icon: "📥", text: "8 elevation studies received (A5 series) — East, West, South garage" },
    { t: Date.now() - 86400000 * 2, icon: "🤖", text: "SUPAFI auto-takeoff: 1,690 sf Mosaic V Plank · 4,739 sf perf screening extracted" },
    { t: Date.now() - 86400000 * 1, icon: "🧊", text: "Parametric 3D model drafted from elevations — pinned to map as PENDING" },
  ],
  notes: [
    "Missile-rated glazing split at EL 45'-6\" (red dashed datum) — large missile below, small missile above.",
    "Mosaic V Plank bands ride the balcony floor lines — confirm soffit return depth.",
  ],
  photos: [],
  finishes: {},
};

/* ---------- Portfolio context pins (delivered 1CG work) ---------- */
SUPAFI.PORTFOLIO = [
  { name: "22 WestEdge", c: [-79.956298, 32.7874848], city: "Charleston" },
  { name: "Kurz Charleston", c: [-79.9462934, 32.8116787], city: "Charleston" },
  { name: "Morrison Yard", c: [-79.9389445, 32.803056], city: "Charleston" },
  { name: "Hotel Bennett", c: [-79.9368565, 32.7871051], city: "Charleston" },
  { name: "IAAM", c: [-79.9253296, 32.7887692], city: "Charleston" },
  { name: "The Square at South End", c: [-80.8601539, 35.2134997], city: "Charlotte" },
  { name: "Bank of America Stadium", c: [-80.852965, 35.2257795], city: "Charlotte" },
  { name: "Charlotte Convention Center", c: [-80.8464461, 35.2226882], city: "Charlotte" },
  { name: "Society Atlanta", c: [-84.3840128, 33.7769993], city: "Atlanta" },
  { name: "Emory Health Sciences", c: [-84.3174501, 33.7942952], city: "Atlanta" },
  { name: "Fifth + Broadway", c: [-86.779636, 36.160674], city: "Nashville" },
];
SUPAFI.OFFICES = [
  { name: "Charlotte HQ + Fabrication", c: [-80.651427, 35.0619522] },
  { name: "Charleston Office", c: [-79.9462934, 32.8116787] },
  { name: "Atlanta Office", c: [-84.5442718, 33.755313] },
];

/* ---------- Roles (RBAC) ---------- */
SUPAFI.ROLES = [
  { id: "admin", name: "Admin", desc: "Full platform control", icon: "◆", perms: { editCrm: true, uploadPhotos: true, changeFinishes: true, present: true } },
  { id: "pm", name: "Project Manager", desc: "CRM, scope, presentation", icon: "▣", perms: { editCrm: true, uploadPhotos: true, changeFinishes: true, present: true } },
  { id: "estimator", name: "Estimator", desc: "Takeoff + materials lab", icon: "∑", perms: { editCrm: false, uploadPhotos: true, changeFinishes: true, present: true } },
  { id: "field", name: "Field Foreman", desc: "Model, photos, details", icon: "⚒", perms: { editCrm: false, uploadPhotos: true, changeFinishes: false, present: false } },
  { id: "client", name: "GC / Client View", desc: "Presentation-grade view only", icon: "◈", perms: { editCrm: false, uploadPhotos: false, changeFinishes: false, present: true } },
];

/* ---------- Chapters (scroll spine = timeline stepper) ---------- */
SUPAFI.CHAPTERS = [
  { id: "ch-map", num: "01", label: "Pin", title: "Pinned. Pending.", curtain: "fade" },
  { id: "ch-intake", num: "02", label: "Intake", title: "Drawings become data", curtain: "blinds" },
  { id: "ch-takeoff", num: "03", label: "Takeoff", title: "The AI takeoff", curtain: "staggerWipe" },
  { id: "ch-model", num: "04", label: "Model", title: "Elevations, extruded", curtain: "doors" },
  { id: "ch-materials", num: "05", label: "Materials", title: "The material lab", curtain: "shutter" },
  { id: "ch-scope", num: "06", label: "Scope", title: "Types & ratings", curtain: "iris" },
  { id: "ch-crm", num: "07", label: "Pipeline", title: "Track it like a deal", curtain: "clipWipe" },
  { id: "ch-present", num: "08", label: "Present", title: "One source. One package.", curtain: "wipe" },
];
