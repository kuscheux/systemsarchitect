/* ============================================================
   MAGNOLIA LANDING — project data (single source for the deck)
   Facts extracted from the Pickard Chilton Curtain Wall RFP set
   (A0.21, A4.01/A4.02 Window Takeoff, A4.01/A4.02 ACM/MP/SOFFIT
   Takeoff — 07 APRIL 2026). Quantities are preliminary takeoff
   values for planning discussion only.
   ============================================================ */
var MAG = window.MAG = window.MAG || {};

MAG.project = {
  name: "Magnolia Landing",
  drawingTitle: "Charleston Magnolia",
  tagline: "Glazing. Cladding. Screening. One coordinated package.",
  subtitle: "Exterior Envelope Presentation",
  city: "Charleston, South Carolina",
  address: "115 Bachman Boulevard, Charleston, SC 29405",
  coordinates: [-79.9722, 32.8462],
  rfp: "Curtain Wall RFP — 07 April 2026",
  status: "Design Assist / Proposal",
  sheetSet: ["A0.21 Preliminary Schedule", "A4.01–A4.02 Window Takeoff", "A4.01–A4.02 ACM / MP / Soffit Takeoff"]
};

MAG.team = [
  { role: "Owner",                 name: "Highland Resources, Inc.",        loc: "Charleston, SC" },
  { role: "Design Consultant",     name: "Pickard Chilton",                 loc: "New Haven, CT" },
  { role: "Architect of Record",   name: "Cooper Carry",                    loc: "Alexandria, VA" },
  { role: "Structural Engineer",   name: "Britt, Peters & Associates",      loc: "Greenville, SC" },
  { role: "MEP Engineer",          name: "Barrett, Woodyard & Associates",  loc: "Charlotte, NC" },
  { role: "Landscape Architect",   name: "Design Works",                    loc: "Charleston, SC" },
  { role: "Civil Engineer",        name: "Revear Group",                    loc: "North Charleston, SC" },
  { role: "Envelope Package",      name: "1CG — Glazing & Cladding",        loc: "One company. One package." }
];

/* ---------- Geometry (from grids + level datums) ---------- */
MAG.levels = [
  { id: "P1",  name: "Level P1 — Parking",        el: 14.5,  use: "parking" },
  { id: "L1",  name: "Level 1 — Lobby / Retail",  el: 15.5,  use: "retail"  },
  { id: "L2",  name: "Level 2 — Parking",         el: 26.5,  use: "parking" },
  { id: "L2O", name: "Level 2 — Office",          el: 32.5,  use: "office"  },
  { id: "L3",  name: "Level 3 — Parking",         el: 36.5,  use: "parking" },
  { id: "L4",  name: "Level 4 — Parking",         el: 46.5,  use: "parking" },
  { id: "L5",  name: "Level 5 — Office",          el: 60.0,  use: "office"  },
  { id: "L6",  name: "Level 6 — Office",          el: 73.5,  use: "office"  },
  { id: "L7",  name: "Level 7 — Office",          el: 87.0,  use: "office"  },
  { id: "L8",  name: "Level 8 — Roof",            el: 101.5, use: "roof"    },
  { id: "L9",  name: "Level 9 — PH Roof",         el: 115.5, use: "roof"    }
];
MAG.building = {
  length: 277.17,          /* 277'-2" — grids 1→12 */
  depth: 171.0,            /* 171'-0" — grids A→F  */
  height: 100.0,           /* grade → Level 8 roof datum band */
  parapet: 103.5,
  phTop: 115.5,
  missile: { largeTo: 30.0, smallTo: 86.0 } /* above grade: large-missile 0–30', small-missile 30'–86' */
};

/* ---------- Envelope systems ---------- */
MAG.systems = [
  {
    key: "cw", tag: "GW-7000", name: "Curtainwall — Unitized",
    maker: "ES Windows", scopeColor: "var(--sc-cw)", scopeName: "Curtainwall / Glazing",
    where: "Office levels — typical floor-to-floor 13'-6\"",
    url: "https://eswindows.com/product/gw-7000/",
    specs: [
      "Unitized · pre-assembled + pre-glazed · hurricane resistant",
      "7\" frame depth · 3½\" sightline",
      "Design load +100 / −140 PSF · water infiltration 15 PSF",
      "U-value 0.37 · large + small missile impact",
      "2- or 4-sided SSG or captured · corner + angled mullions",
      "Optional integrated railing · Miami-Dade approved",
      "Laminated + insulating laminated glass (~1 5/16\" IG)",
      "Finishes: anodized, painted, or wood-grain"
    ],
    img: "assets/detail-unitized.jpg"
  },
  {
    key: "sf", tag: "ES-7525", name: "Storefront / Base CW — Stick",
    maker: "ES Windows", scopeColor: "var(--sc-cw)", scopeName: "Curtainwall / Glazing",
    where: "Lobby, retail and base levels",
    url: "https://eswindows.com/product/es-7525/",
    specs: [
      "Stick-built · thermally improved · impact + blast resistant",
      "7½\" mullion depth · 2½\" sightline · shear-block construction",
      "Design load +100 / −100 PSF · water infiltration 20 PSF",
      "U-value 0.37 · blast 5.8 psi / 41.1 psi-msec (GSA 2 · DoD Medium)",
      "9/16\" laminated · 1 5/16\" insulating laminated · 1\" IG non-impact",
      "Captured verticals/horizontals + SSG vertical option",
      "Integral ES-9000 impact-door adaptor · EPDM gaskets",
      "Finishes: anodized, painted, or wood-grain"
    ],
    img: "assets/detail-storefront.jpg"
  },
  {
    key: "ent", tag: "ES-9000 / ES-46T", name: "Entrances",
    maker: "ES Windows", scopeColor: "var(--sc-ent)", scopeName: "Entrances / Storefront",
    where: "Lobby entries, retail doors, terrace access",
    url: "https://eswindows.com/product/es-9000-impact-door/",
    specs: [
      "ES-9000 impact entry — outswing or inswing · blast + hurricane rated",
      "5\" frame · 2¼\" leaf · 1¾\" or 2½\" sightline",
      "Singles to 53\"×120\" · doubles to 101\"×120\" · 144\" H with transom",
      "±120 PSF design load · water 18 PSF · stainless hardware",
      "ES-46T outswing terrace door — thermally broken · 4½\" frame",
      "+100 / −120 PSF · U-value 0.44 / SHGC 0.21 · multi-point hardware",
      "Standard + ADA thresholds (2¼\" / ½\") · welded reinforced corners"
    ],
    img: "assets/detail-entrance.jpg"
  },
  {
    key: "acm", tag: "ACM / MCM", name: "Architectural Metal Panels",
    maker: "Routed + fabricated by 1CG", scopeColor: "var(--sc-acm)", scopeName: "ACM Panels",
    where: "Spandrels, column covers, penthouse crown",
    specs: [
      "Aluminum composite (MCM) rainscreen panels",
      "Dual aluminum skins · PE or fire-rated (FR) mineral core",
      "Custom green PVDF / Kynar factory finish",
      "Routed, returned + fabricated flat wall panels",
      "Part of the MCM · PAP · HPL single-source cladding line",
      "Sequenced with the Level 1–6 curtainwall schedule"
    ],
    img: "assets/elev-west-acm.jpg"
  },
  {
    key: "screen", tag: "PERF", name: "Garage Screening",
    maker: "Perforated aluminum / ACM", scopeColor: "var(--sc-screen)", scopeName: "Garage Screening",
    where: "Parking levels 2–4 — south + east faces",
    specs: [
      "Perforated metal panels — aluminum or ACM",
      "Airflow + visual screening at parking decks",
      "Openness ratio per ventilation requirements",
      "Wind-load engineered attachment",
      "Finish matched to the façade palette"
    ],
    img: "assets/detail-screening.jpg"
  },
  {
    key: "plank", tag: "6\" V-PLANK", name: "Wood-Grain Soffits",
    maker: "Mosaic V-Plank", scopeColor: "var(--sc-plank)", scopeName: "Wood-Grain Soffits / V-Plank",
    where: "Balcony soffits + entry canopy bands",
    specs: [
      "Aluminum plank — wood-grain sublimation print",
      "Varied-width linear \"mosaic\" plank module (6\")",
      "Undersides of overhangs, canopies + terrace ceilings",
      "Warm wood appearance with metal durability",
      "Grain family pending design-assist selection"
    ],
    img: "assets/detail-plank.jpg"
  }
];

MAG.specNote = "Manufacturer-published system capabilities (eswindows.com). Project glass make-ups, finishes, and load ratings are set by the approved shop drawings and construction documents.";

/* ---------- Scope summary (planning-level quantities) ---------- */
MAG.scopeSummary = {
  heading: "Exterior Envelope Scope",
  metrics: [
    { label: "Curtainwall Systems",                 value: "ES-7525 / GW-7000", sub: "basis-of-design systems" },
    { label: "Garage Screening",                    value: "≈ 12,000 SF",       sub: "perforated metal panels" },
    { label: "Architectural Cladding / Soffit",     value: "≈ 2,600–2,700 SF",  sub: "ACM + Mosaic V-Plank" },
    { label: "Total Cladding + Screening",          value: "≈ 14,700 SF",       sub: "combined planning quantity" },
    { label: "Entrances / Storefront",              value: "ES-9000 / ES-46T",  sub: "ES entrance + storefront systems" }
  ],
  note: "Quantities are preliminary takeoff values and should be verified against final contract documents."
};

/* per-elevation takeoff annotations (from the ACM/MP/Soffit sheets) */
MAG.takeoffDetail = [
  { elev: "South", sys: "screen", note: "Primary screening band — parking levels 2–4" },
  { elev: "East",  sys: "screen", note: "Screening panels 1,007.9 / 442.6 / 271.3 SF" },
  { elev: "West",  sys: "plank",  note: "93.2 SF plank bands at balcony recesses" },
  { elev: "North", sys: "plank",  note: "6\" Mosaic V-Plank soffit runs + 50.2 SF bands" }
];

/* ---------- Verbatim section copy ---------- */
MAG.copy = {
  overview: {
    body: "Magnolia Landing is a mixed-use building envelope scope combining high-performance curtainwall systems, architectural cladding, garage screening, soffits, and entrance systems into one coordinated exterior package.",
    bullets: [
      "Curtainwall and glazing systems",
      "Storefront and entrance systems",
      "Architectural ACM panels",
      "Perforated garage screening",
      "Wood-grain soffit / plank systems",
      "Sealants, transitions, and closeout coordination"
    ]
  },
  scopeMap: {
    body: "The exterior scope is organized by system type so the project team can quickly understand what is included, where it occurs, and how each scope relates to the overall façade package."
  },
  systems: {
    body: "Magnolia Landing combines multiple envelope systems that must be coordinated across design, fabrication, delivery, installation, and closeout."
  },
  materials: {
    body: "Material selections shown are for design-assist review and visual coordination. Final finish, profile, and manufacturer selections will be confirmed through the project team during the design-assist process.",
    status: "Design Assist / Pending Final Selection"
  },
  installStrategy: {
    main: "Installation sequencing is coordinated with structural progression, slab-edge verification, embed locations, field tolerances, and approved shop drawings.",
    support: "Rather than treating each level as an isolated activity, the façade installation plan depends on confirming the building plane, anchor strategy, and readiness of surrounding conditions before production installation advances.",
    safe: "Current duration assumptions are intended for planning-level discussion and will be refined with the GC, structural progress, embed strategy, shop drawings, manpower plan, and material delivery schedule.",
    steps: [
      "Structure progresses ahead",
      "Field verification",
      "Embed / slab edge confirmation",
      "Curtainwall installation begins",
      "Cladding follows",
      "Screening and soffits complete",
      "Sealants and closeout"
    ]
  },
  installFlow: {
    body: "For unitized curtainwall, installation readiness is tied to structural advancement and field verification. The team confirms slab conditions, embeds, and alignment before progressing into production installation.",
    note: "Final sequencing will be coordinated with the GC's structure schedule and approved installation plan.",
    floors: [
      { level: "Level 6", state: "Structure advancing / verification zone", phase: "verify" },
      { level: "Level 5", state: "Ready / embed and tolerance confirmation", phase: "ready" },
      { level: "Level 4", state: "Active curtainwall installation", phase: "active" },
      { level: "Level 3", state: "Follow-on cladding / sealants", phase: "follow" }
    ]
  },
  fabrication: {
    body: "1CG supports the envelope package through coordinated fabrication and installation planning, including routed ACM fabrication, material staging, quality checks, and field-ready delivery.",
    es: "Curtainwall and glazing systems are coordinated with ES manufacturing and shop drawing requirements prior to delivery and installation.",
    steps: ["Raw Material", "CNC Routing", "Panel Fabrication", "Quality Review", "Packaging / Delivery", "Field Installation"]
  },
  matrix: {
    title: "Project Coordination Matrix",
    body: "Successful envelope delivery depends on clear ownership across design, fabrication, structure readiness, material delivery, installation, and closeout.",
    rows: [
      { activity: "Shop Drawings",            lead: "1CG",           support: "ES",         status: "Design Assist" },
      { activity: "Engineering",              lead: "ES",            support: "1CG",        status: "Pending Final Coordination" },
      { activity: "Embeds / Anchor Strategy", lead: "GC",            support: "1CG / ES",   status: "To Be Confirmed" },
      { activity: "Curtainwall Fabrication",  lead: "ES",            support: "—",          status: "Pending Release" },
      { activity: "ACM Fabrication",          lead: "1CG",           support: "—",          status: "Pending Final Material Selection" },
      { activity: "Garage Screening",         lead: "Manufacturer",  support: "1CG",        status: "Pending Final Coordination" },
      { activity: "Wood-Grain Soffits",       lead: "Manufacturer",  support: "1CG",        status: "Design Assist" },
      { activity: "Field Installation",       lead: "1CG",           support: "—",          status: "Future Phase" },
      { activity: "QA / QC",                  lead: "1CG",           support: "ES",         status: "Ongoing" },
      { activity: "Closeout",                 lead: "1CG",           support: "—",          status: "Future Phase" }
    ]
  },
  experience: {
    body: "1CG brings relevant façade, glazing, cladding, screening, and envelope coordination experience across complex commercial projects."
  },
  quality: {
    body: "Quality is managed through coordinated shop drawings, material checks, fabrication review, installation verification, sealant coordination, and final punch closeout.",
    bullets: [
      "Shop drawing coordination",
      "Material verification",
      "Fabrication quality checks",
      "Field installation review",
      "Sealant and transition coordination",
      "Final punch and closeout"
    ]
  },
  closing: {
    name: "Magnolia Landing",
    body: "A coordinated exterior envelope package delivered through design assist, fabrication planning, field verification, and disciplined installation sequencing.",
    line: "One team. One package. One coordinated façade."
  }
};

/* ---------- Similar project experience ---------- */
MAG.experience = [
  { name: "22 Westedge",               loc: "Charleston, SC", scope: "Curtain wall, storefront, entrances, retail glazing",       img: "assets/projects/22-westedge.png" },
  { name: "Morrison Yard",             loc: "Charleston, SC", scope: "12-story office — curtain wall + high-performance glazing", img: "https://static.wixstatic.com/media/da5297_780faa40edbb4027927a18124d4493b1~mv2.jpg", remote: true },
  { name: "King & Calhoun",            loc: "Charleston, SC", scope: "Hospitality glazing, storefront, entrances",                img: "assets/projects/king-calhoun.png" },
  { name: "USC School of Law",         loc: "Charleston, SC", scope: "Storefront, entrances, institutional coordination",         img: "assets/projects/usc-school-of-law.png" },
  { name: "Central Library Renovation",loc: "Atlanta, GA",    scope: "Civic glazing, storefront, security-aware glass",           img: "assets/projects/central-library-renovation.png" },
  { name: "Kurz Charleston",           loc: "Charleston, SC", scope: "Storefront, entrances, classroom glazing",                  img: "assets/projects/kurz-charleston.png" }
];

/* ---------- Preliminary schedule structure (A0.21 — planning-level) ---------- */
MAG.schedule = [
  { phase: "Design Assist",                        kind: "pre"  },
  { phase: "Pricing & Award",                      kind: "pre"  },
  { phase: "Submittals / Shop Drawings & Approval",kind: "pre"  },
  { phase: "Material Procurement",                 kind: "pre"  },
  { phase: "Levels 1–5 — Layout, dry-in + unit install", kind: "field" },
  { phase: "Punch List & Closeout",                kind: "field" }
];
