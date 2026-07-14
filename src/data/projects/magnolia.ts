import type {
  Hotspot,
  ProjectDecision,
  PursuitProject,
} from "@/data/pursuits/types";

export const magnoliaProject: PursuitProject = {
  id: "magnolia-landing",
  name: "Magnolia Landing",
  location: "Charleston, South Carolina",
  address: "115 Bachman Boulevard, Charleston, SC",
  status: "Active pursuit / design assist",
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
    selectedValue: "ES Metals 3mm perforated aluminum with tube framing",
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
  },
  {
    id: "entrances",
    xPct: 57,
    yPct: 72,
    label: "Entrances",
    productId: "es-9000",
    chapterIds: ["glazing"],
  },
  {
    id: "acm",
    xPct: 33,
    yPct: 33,
    label: "Charleston Green ACM",
    productId: "alucobond-charleston-green",
    chapterIds: ["cladding", "materials"],
  },
  {
    id: "v-groove",
    xPct: 72,
    yPct: 25,
    label: "Woodgrain soffit",
    productId: "lumabuilt-v-groove",
    chapterIds: ["cladding", "materials"],
  },
  {
    id: "garage-screen",
    xPct: 43,
    yPct: 62,
    label: "Garage screening",
    productId: "es-garage-screen",
    chapterIds: ["screening"],
  },
];
