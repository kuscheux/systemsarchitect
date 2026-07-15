import type {
  Hotspot,
  ProjectDecision,
  PursuitProject,
} from "@/data/pursuits/types";

export const magnoliaProject: PursuitProject = {
  id: "magnolia-landing",
  name: "Magnolia Landing",
  location: "Charleston, South Carolina",
  address: "2198 Milford St, Charleston, SC 29405",
  status: "Pending",
  package: "Exterior envelope",
  owner: "Highland Resources",
  architect: "Cooper Carry",
  designArchitect: "Pickard Chilton",
  presentedBy: "1CG + ES",
  scopeSummary:
    "Glazing, ACM, aluminum plank soffits, garage screening, entrances, logistics, and installation coordinated as one exterior-envelope record.",
  scopeMetrics: [
    { label: "ACM", value: "34,273 SF" },
    { label: "V-Groove Plank", value: "7,800 SF" },
    { label: "Garage Screen", value: "12,500 SF" },
  ],
};

export const magnoliaDecisions: ProjectDecision[] = [
  {
    id: "acm-finish",
    type: "finish",
    title: "ACM finish",
    selectedValue: "Custom 3-coat Charleston Green",
    rationale: "One controlled custom color across the 1,591-panel ACM package.",
    source: "deck",
  },
  {
    id: "soffit-finish",
    type: "finish",
    title: "V-Groove plank finish",
    selectedValue: "Single standard woodgrain",
    rationale: "A consistent wood expression across 7,800 square feet of aluminum plank.",
    source: "deck",
  },
  {
    id: "screen-system",
    type: "system",
    title: "Garage screening",
    selectedValue: "ES 3mm perforated aluminum with tube framing",
    rationale: "Ventilation, durability, and a purpose-engineered architectural screen condition.",
    source: "deck",
  },
];

export const magnoliaHotspots: Hotspot[] = [
  {
    id: "curtain-wall",
    xPct: 64,
    yPct: 39,
    label: "Curtain wall",
    productId: "gw-7000",
    chapterIds: ["overview", "glazing"],
    summary:
      "Unitized curtain wall, slab-edge spandrels, mullions, fins, anchors, and perimeter transitions form the primary office enclosure.",
    metrics: [
      { label: "System", value: "GW-7000" },
      { label: "Spandrel", value: "GL-2 Pattern" },
      { label: "Mullion", value: "AL-1" },
    ],
    focusScale: 1.08,
  },
  {
    id: "entrances",
    xPct: 57,
    yPct: 72,
    label: "Entrances",
    productId: "es-9000",
    chapterIds: ["glazing"],
    summary:
      "Commercial entrances coordinate door systems, thresholds, hardware, waterproofing, and adjacent storefront or curtain-wall framing.",
    metrics: [
      { label: "Entrance", value: "ES-9000" },
      { label: "Outswing", value: "ES-46T" },
      { label: "Stick Wall", value: "ES-7525" },
    ],
    focusScale: 1.1,
  },
  {
    id: "acm",
    xPct: 33,
    yPct: 33,
    label: "Charleston Green ACM",
    productId: "alucobond-charleston-green",
    chapterIds: ["cladding", "materials"],
    summary:
      "The ACM package uses one custom Charleston Green across 1,591 fabricated panels coordinated to glazing and soffit returns.",
    metrics: [
      { label: "Area", value: "34,273 SF" },
      { label: "Panels", value: "1,591" },
      { label: "Material", value: "4mm ACM" },
    ],
    focusScale: 1.09,
  },
  {
    id: "v-groove",
    xPct: 72,
    yPct: 25,
    label: "Woodgrain soffit",
    productId: "lumabuilt-v-groove",
    chapterIds: ["cladding", "materials"],
    summary:
      "Six-inch extruded aluminum planks deliver a controlled woodgrain expression across soffit and terrace conditions.",
    metrics: [
      { label: "Area", value: "7,800 SF" },
      { label: "Profile", value: "6 in." },
      { label: "Finish", value: "One Woodgrain" },
    ],
    focusScale: 1.12,
  },
  {
    id: "garage-screen",
    xPct: 43,
    yPct: 62,
    label: "Garage screening",
    productId: "es-garage-screen",
    chapterIds: ["screening"],
    summary:
      "Perforated aluminum panels and tube framing coordinate ventilation, garage structure, crash barriers, and adjacent facade transitions.",
    metrics: [
      { label: "Area", value: "12,500 SF" },
      { label: "Panel", value: "3mm Aluminum" },
      { label: "Support", value: "Tube Framing" },
    ],
    focusScale: 1.08,
  },
];
