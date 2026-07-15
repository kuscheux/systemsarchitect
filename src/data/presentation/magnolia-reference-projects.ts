import { projectLocations } from "@/data/project-locations";
import { projects } from "@/data/projects";
import type { ReferenceProject } from "@/data/pursuits/types";

const CHARLESTON_METRO_CITIES = [
  "Charleston, SC",
  "North Charleston, SC",
  "Mount Pleasant, SC",
  "Goose Creek, SC",
  "Kiawah Island, SC",
] as const;

function locationFromAddress(address: string) {
  return (
    CHARLESTON_METRO_CITIES.find((city) => address.includes(city)) ??
    "Charleston, SC"
  );
}

const referenceOverrides: Partial<Record<string, Partial<ReferenceProject>>> = {
  "waterfront-hotel": {
    name: "The Cooper",
    sourceType: "magnolia-pdf",
    relevance:
      "Nearby waterfront hospitality work with multiple opening types and a 20-week dry-in sequence.",
    metrics: [
      { label: "Windows", value: "990+/-" },
      { label: "Terrace Doors", value: "190+/-" },
      { label: "Dry-In", value: "20 Weeks" },
    ],
    facts: [
      "30+/- storefront doors",
      "Multiphase sliding-door systems",
      "$7.3 million reference value",
    ],
  },
  "22-westedge": {
    sourceType: "magnolia-pdf",
    relevance:
      "A nearby Charleston curtain-wall project coordinated across 33 glass types and a compressed exterior sequence.",
    metrics: [
      { label: "Curtain Wall", value: "806 SF" },
      { label: "Glass Types", value: "33" },
      { label: "Exterior", value: "22 Weeks" },
    ],
    facts: [
      "Dry-in achieved in 16 weeks",
      "Office and research program",
      "Exterior completed in 22 weeks",
    ],
  },
  "morrison-yard-office-building": {
    address: "830 Morrison Dr, Charleston, SC 29403",
    sourceType: "magnolia-pdf",
    relevance:
      "A 12-story Charleston Class A office facade coordinated with retail and a four-story parking structure.",
    metrics: [
      { label: "Height", value: "12 Stories" },
      { label: "Parking", value: "277+/- Spaces" },
      { label: "Complete", value: "Summer 2022" },
    ],
    facts: [
      "Four-story parking structure",
      "Class A office building",
      "$3,285,879 reference value",
    ],
  },
};

const catalogProjects: ReferenceProject[] = projects
  .filter((project) => {
    const location = projectLocations[project.slug];
    return Boolean(
      location &&
        CHARLESTON_METRO_CITIES.some((city) => location.address.includes(city)),
    );
  })
  .map((project) => {
    const location = projectLocations[project.slug];
    const base: ReferenceProject = {
      id: project.slug,
      name: project.name,
      status: "complete",
      market: project.market,
      location: locationFromAddress(location.address),
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      image: project.image,
      href: `/projects/${project.slug}`,
      description: project.description,
      scope: project.scope,
      sourceType: "site",
      relevance: project.overview,
      metrics: [
        { label: "Market", value: project.market },
        { label: "Region", value: project.region },
        { label: "Status", value: "Complete" },
      ],
      facts: [project.scope, project.projectType, project.completion],
    };

    return { ...base, ...referenceOverrides[project.slug] };
  });

const magnoliaLanding: ReferenceProject = {
  id: "magnolia-landing",
  name: "Magnolia Landing",
  status: "pending",
  client: "Highland Resources",
  market: "Mixed-Use",
  location: "Charleston, SC",
  address: "2198 Milford St, Charleston, SC 29405",
  latitude: 32.824252,
  longitude: -79.961,
  image: "/images/magnolia/magnolia-rfp-rendering.webp",
  href: "/project-pins/magnolia",
  description:
    "A pending Charleston pursuit coordinating glazing, cladding, soffits, garage screening, entrances, logistics, and installation.",
  scope:
    "GW-7000, ES-7525, ES-46T, ES-9000, 4mm ALUCOBOND ACM, 6-inch LumaBuilt V-Groove, and ES Metals perforated aluminum screening.",
  productIds: [
    "gw-7000",
    "es-7525",
    "es-46t",
    "es-9000",
    "alucobond-charleston-green",
    "lumabuilt-v-groove",
    "es-garage-screen",
  ],
  sourceType: "magnolia-pdf",
  relevance:
    "The active pursuit brings the complete exterior-envelope package into one Charleston delivery plan.",
  metrics: [
    { label: "ACM", value: "34,273 SF" },
    { label: "V-Groove", value: "7,800 SF" },
    { label: "Screening", value: "12,500 SF" },
  ],
  facts: [
    "1,591 custom Charleston Green 4mm ACM panels",
    "7,800 SF of 6-inch aluminum V-Groove plank",
    "12,500 SF of 3mm perforated aluminum screening with tube framing",
  ],
};

export const magnoliaReferenceProjects: ReferenceProject[] = [
  magnoliaLanding,
  ...catalogProjects,
];

if (magnoliaReferenceProjects.length !== 25) {
  throw new Error(
    `Expected 25 Charleston presentation locations, received ${magnoliaReferenceProjects.length}`,
  );
}
