import type {
  MagnoliaChapterId,
  PresentationAppearance,
  PursuitChapter,
  PursuitScene,
  SourceReference,
} from "@/data/pursuits/types";

type DeckSlideDefinition = {
  chapterId: MagnoliaChapterId;
  title: string;
  lead: string;
  theme: PresentationAppearance;
};

const deckSlides: DeckSlideDefinition[] = [
  { chapterId: "hero", title: "Magnolia Landing", lead: "Exterior envelope proposal for Charleston, South Carolina.", theme: "dark" },
  { chapterId: "overview", title: "Cladding and glazing move as one exterior-envelope package.", lead: "One coordinated team aligns fabrication, procurement, installation, and technical continuity.", theme: "dark" },
  { chapterId: "logistics", title: "A controlled path from factory to jobsite.", lead: "Pre-cleared ocean freight and direct truck transfer reduce handoffs before installation.", theme: "light" },
  { chapterId: "overview", title: "The project is moving from structure to enclosure.", lead: "The delivery plan now centers on approvals, material release, and floor-by-floor installation.", theme: "dark" },
  { chapterId: "installation", title: "The schedule protects procurement and floor-by-floor flow.", lead: "Design assist through punch list follows one visible critical path.", theme: "light" },
  { chapterId: "cladding", title: "The exterior palette gives Magnolia Landing its warm Charleston identity.", lead: "ACM, woodgrain soffits, and perforated screening form one architectural composition.", theme: "dark" },
  { chapterId: "cladding", title: "Division 7 arrives as one coordinated package.", lead: "Fabrication and field installation stay aligned with the curtain-wall schedule.", theme: "light" },
  { chapterId: "cladding", title: "Three materials create one envelope expression.", lead: "34,273 SF of ACM, 7,800 SF of V-groove plank, and 12,500 SF of screening.", theme: "light" },
  { chapterId: "cladding", title: "The soffit finish adds warmth without sacrificing durability.", lead: "A six-inch V-plank creates a continuous woodgrain ceiling plane.", theme: "dark" },
  { chapterId: "materials", title: "A 27-finish palette supports the final woodgrain selection.", lead: "Variance ratings communicate expected tone and pattern movement.", theme: "light" },
  { chapterId: "screening", title: "Garage screening becomes an architectural facade.", lead: "Perforated aluminum and a disciplined tube-frame rhythm cover 12,500 square feet.", theme: "dark" },
  { chapterId: "screening", title: "Four layers make the screening system buildable.", lead: "Perforated face, primary mullions, attachment hardware, and structural interface work as one system.", theme: "light" },
  { chapterId: "screening", title: "The work is released in a controlled five-step sequence.", lead: "Verify, engineer, approve, fabricate, and install.", theme: "light" },
  { chapterId: "glazing", title: "Performance, clarity, and installation sequence come together in one Division 8 package.", lead: "GW-7000, ES-7525, ES-46T, and ES-9000 form one coordinated glazing scope.", theme: "light" },
  { chapterId: "glazing", title: "The outswing glass door combines impact performance with facade continuity.", lead: "ES-46T coordinates impact performance, thermal continuity, locking, and finish range.", theme: "light" },
  { chapterId: "glazing", title: "Published ES-46T performance values are organized for fast review.", lead: "Frame, sight line, infiltration, design load, and tested panel data remain visible together.", theme: "dark" },
  { chapterId: "glazing", title: "A robust entrance door is designed around weathering, hardware, and accessibility.", lead: "ES-9000 coordinates factory assembly, weathering, hardware, and threshold options.", theme: "light" },
  { chapterId: "glazing", title: "The entrance system supports demanding wind and water criteria.", lead: "Single- and double-door configurations carry tested performance data.", theme: "light" },
  { chapterId: "glazing", title: "The unitized curtain wall is built for fast enclosure and coastal performance.", lead: "GW-7000 moves pre-assembled, pre-glazed work into controlled factory conditions.", theme: "dark" },
  { chapterId: "glazing", title: "One page carries the complete GW-7000 performance set.", lead: "Structural, environmental, thermal, solar, and acoustic values are organized together.", theme: "light" },
  { chapterId: "glazing", title: "Field integration is managed through a disciplined coordination checklist.", lead: "Anchorage, slab interfaces, perimeter sealing, verification, and closeout are assigned responsibilities.", theme: "light" },
  { chapterId: "glazing", title: "A refined vertical transition preserves the facade grid.", lead: "The GW-7000 bullnose maintains sight line, continuity, integration, and finish flexibility.", theme: "dark" },
  { chapterId: "glazing", title: "The stick-built curtain wall handles adaptable field conditions.", lead: "ES-7525 supports multiple glazing and span strategies.", theme: "light" },
  { chapterId: "glazing", title: "ES-7525 performance and flexibility are organized for fast review.", lead: "Design load, water infiltration, thermal performance, and span configurations remain clear.", theme: "light" },
  { chapterId: "materials", title: "Lower-iron glass protects clarity, daylight, and color.", lead: "The comparison makes the visual consequence of the glass selection explicit.", theme: "light" },
  { chapterId: "proof", title: "A consistently low EMR supports safe, disciplined execution.", lead: "The current experience modifier is 0.78.", theme: "light" },
  { chapterId: "proof", title: "Local Charleston experience shortens the distance between issue and action.", lead: "Magnolia's complete package is supported from 1CG's Charleston office.", theme: "light" },
  { chapterId: "materials", title: "Waterfront Hotel / The Cooper", lead: "A complex hospitality envelope delivered across an extended, design-intensive program.", theme: "light" },
  { chapterId: "materials", title: "22 West Edge", lead: "Curtain-wall scale, distinct glass types, and a documented enclosure schedule.", theme: "dark" },
  { chapterId: "materials", title: "Morrison Yard demonstrates waterfront-scale execution.", lead: "Comparable Class A office, retail, parking, and facade delivery in Charleston.", theme: "light" },
  { chapterId: "materials", title: "Ready to coordinate the next move.", lead: "Charleston, Charlotte, and Atlanta teams are ready for the next decision.", theme: "dark" },
];

export const magnoliaExpandedChapters: PursuitChapter[] = [
  { id: "hero", title: "Opening", subtitle: "Magnolia Landing", activeHotspotIds: [], panelTemplate: "overview" },
  { id: "overview", title: "Envelope", subtitle: "One coordinated team", activeHotspotIds: [], panelTemplate: "overview" },
  { id: "logistics", title: "Delivery", subtitle: "Factory to jobsite", activeHotspotIds: [], panelTemplate: "logistics" },
  { id: "installation", title: "Schedule", subtitle: "Procurement and installation", activeHotspotIds: [], panelTemplate: "logistics" },
  { id: "cladding", title: "Cladding", subtitle: "Division 7", activeHotspotIds: [], panelTemplate: "finish" },
  { id: "screening", title: "Screening", subtitle: "ES Metals", activeHotspotIds: [], panelTemplate: "product" },
  { id: "glazing", title: "Glazing", subtitle: "Division 8", activeHotspotIds: [], panelTemplate: "product" },
  { id: "proof", title: "Proof", subtitle: "Safety and local delivery", activeHotspotIds: [], panelTemplate: "proof" },
  { id: "materials", title: "Experience", subtitle: "Relevant work and close", activeHotspotIds: [], panelTemplate: "proof" },
];

const renderedSlides: PursuitScene[] = deckSlides.map((slide, index) => ({
  id: `expanded-slide-${String(index + 1).padStart(2, "0")}`,
  chapterId: slide.chapterId,
  type: "deck",
  preferredTheme: slide.theme,
  eyebrow: `${String(index + 1).padStart(2, "0")} / ${slide.chapterId}`,
  title: slide.title,
  lead: slide.lead,
  image: `/images/magnolia/deck-v2/slide-${String(index + 1).padStart(2, "0")}.webp`,
  video: index === 0 ? "/videos/brand/1cg-brand-anthem.mp4" : undefined,
  durationMs: index === 0 ? 226000 : undefined,
  metrics: [],
  evidence: [],
  sourcePageIds: [],
  hotspotIds: [],
  productIds: [],
  presenterNote: {
    lead: slide.title,
    talkingPoints: [slide.lead],
  },
}));

const cadViewerScene: PursuitScene = {
  id: "expanded-gw-7000-cad",
  chapterId: "glazing",
  type: "model",
  preferredTheme: "light",
  eyebrow: "Division 8 / Interactive Detail",
  title: "Interactive CAD details.",
  lead: "Rotate, zoom, and inspect the GW-7000 typical stack-joint geometry as a material-neutral coordination model.",
  image: "/images/magnolia/deck-v2/slide-21.webp",
  metrics: [
    { label: "System", value: "GW-7000" },
    { label: "View", value: "Stack Joint" },
    { label: "Control", value: "Rotate + Zoom" },
  ],
  evidence: [],
  sourcePageIds: [],
  hotspotIds: [],
  productIds: ["gw-7000"],
  modelUrl: "/models/magnolia/gw-7000-typ-stack-joint.obj",
  modelLabel: "GW-7000 typical stack joint",
  presenterNote: {
    lead: "Inspect the coordinated stack-joint geometry directly.",
    talkingPoints: ["The model supplements the field-integration checklist without replacing approved shop drawings."],
  },
};

const charlestonRouteScene: PursuitScene = {
  id: "expanded-charleston-field-route",
  chapterId: "logistics",
  type: "route",
  preferredTheme: "dark",
  eyebrow: "Charleston Field Route",
  title: "45 stops. One continuous run.",
  lead: "A continuous route through industrial, peninsula, waterfront, and coastal work across greater Charleston.",
  image: "/images/magnolia/deck-v2/slide-03.webp",
  metrics: [
    { label: "Stops", value: "45" },
    { label: "Phases", value: "5" },
    { label: "Region", value: "Greater Charleston" },
  ],
  evidence: [],
  sourcePageIds: [],
  hotspotIds: [],
  productIds: [],
  routeDataUrl: "/data/magnolia-charleston-route.json",
  routeDurationMs: 72_000,
  presenterNote: {
    lead: "Follow the complete Charleston route as one connected field itinerary.",
    talkingPoints: [
      "The route moves through five geographic phases and keeps the full trip visible as the lead point advances.",
    ],
  },
};

export const magnoliaExpandedScenes: PursuitScene[] = [
  renderedSlides[0],
  charlestonRouteScene,
  ...renderedSlides.slice(1, 21),
  cadViewerScene,
  ...renderedSlides.slice(21),
];

export const magnoliaExpandedSourceReferences: SourceReference[] = [];

export const magnoliaExpandedChapterFirstSceneIndex = magnoliaExpandedChapters.reduce<Record<string, number>>(
  (result, chapter) => {
    result[chapter.id] = magnoliaExpandedScenes.findIndex((scene) => scene.chapterId === chapter.id);
    return result;
  },
  {},
);

export const magnoliaPresentationVersions = [
  { id: "expanded-2026-07-15", label: "Redesigned Expanded", sceneCount: magnoliaExpandedScenes.length, active: true },
  { id: "web-native-2026-07-15", label: "Web Native Pursuit", sceneCount: 24, active: false },
] as const;
