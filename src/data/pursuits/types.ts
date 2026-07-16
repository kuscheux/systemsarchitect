export type MagnoliaChapterId =
  | "hero"
  | "overview"
  | "glazing"
  | "cladding"
  | "screening"
  | "materials"
  | "logistics"
  | "installation"
  | "proof";

export type VendorId = "es" | "esmetals" | "lumabuilt" | "alucobond" | "saint-gobain";

export type SceneMetric = {
  label: string;
  value: string;
};

export type SceneType =
  | "deck"
  | "route"
  | "hero"
  | "scope"
  | "hotspot"
  | "evidence"
  | "finish"
  | "gantt"
  | "model"
  | "sequence"
  | "proof"
  | "reference";

export type PresentationAppearance = "light" | "dark";
export type PresentationTheme = "auto" | PresentationAppearance;

export type SceneContext = {
  eyebrow: string;
  title: string;
  facts: string[];
};

export type SceneEvidence = {
  sourceId: string;
  label: string;
};

export type PresenterNote = {
  lead: string;
  talkingPoints: string[];
};

export type TechnicalDetail = {
  id: string;
  title: string;
  sheet: string;
  detail: string;
  image: string;
  alt: string;
  callouts: string[];
  sourceStatus?: "project-specific" | "reference-assembly";
};

export type ProductVisual = {
  id: string;
  title: string;
  image: string;
  alt: string;
  sourceUrl: string;
};

export type FloorSequenceStep = {
  floor: string;
  duration: string;
};

export type VendorProduct = {
  id: string;
  vendor: VendorId;
  name: string;
  category: string;
  summary: string;
  specs: SceneMetric[];
  finishes?: string[];
  documents?: { label: string; url: string }[];
  sourceUrl?: string;
  sourceType: "vendor" | "deck" | "manual";
  verifiedAt?: string;
};

export type Hotspot = {
  id: string;
  xPct: number;
  yPct: number;
  label: string;
  productId?: string;
  chapterIds: MagnoliaChapterId[];
  mediaKey?: string;
  summary?: string;
  metrics?: SceneMetric[];
  focusScale?: number;
};

export type ReferenceProject = {
  id: string;
  name: string;
  status: "pending" | "complete";
  client?: string;
  market: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  image: string;
  href?: string;
  description: string;
  scope: string;
  productIds?: string[];
  sourceType: "site" | "magnolia-pdf";
  relevance: string;
  metrics: SceneMetric[];
  facts: string[];
};

export type PursuitChapter = {
  id: MagnoliaChapterId;
  title: string;
  subtitle: string;
  activeHotspotIds: string[];
  panelTemplate: "overview" | "product" | "finish" | "logistics" | "proof";
};

export type ProjectDecision = {
  id: string;
  type: "finish" | "system" | "vendor";
  title: string;
  selectedValue: string;
  rationale?: string;
  source: "approved-submittal" | "deck" | "vendor-page" | "manual";
};

export type SourceReference = {
  id: string;
  page: number;
  title: string;
  thumbnail: string;
  full: string;
};

export type PursuitScene = {
  id: string;
  chapterId: MagnoliaChapterId;
  type: SceneType;
  preferredTheme: PresentationAppearance;
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  video?: string;
  durationMs?: number;
  metrics: SceneMetric[];
  evidence: SceneEvidence[];
  sourcePageIds: string[];
  hotspotIds: string[];
  productIds?: string[];
  presenterNote: PresenterNote;
  context?: SceneContext;
  decisionIds?: string[];
  technicalLayout?: "overview" | "single" | "paired" | "triptych";
  technicalDetails?: TechnicalDetail[];
  modelUrl?: string;
  modelLabel?: string;
  productVisuals?: ProductVisual[];
  floorSequence?: FloorSequenceStep[];
  referenceProjects?: ReferenceProject[];
  routeDataUrl?: string;
  routeDurationMs?: number;
};

export type PursuitProject = {
  id: string;
  name: string;
  location: string;
  address: string;
  status: string;
  package: string;
  owner: string;
  architect: string;
  designArchitect: string;
  presentedBy: string;
  scopeSummary: string;
  scopeMetrics: SceneMetric[];
};
