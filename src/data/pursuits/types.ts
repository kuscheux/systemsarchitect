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

export type VendorId = "eswindows" | "esmetals" | "lumabuilt" | "alucobond";

export type SceneMetric = {
  label: string;
  value: string;
};

export type SceneEvidence = {
  sourceId: string;
  label: string;
};

export type PresenterNote = {
  lead: string;
  talkingPoints: string[];
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
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  video?: string;
  durationMs?: number;
  metrics: SceneMetric[];
  evidence: SceneEvidence[];
  sourcePageIds: string[];
  hotspotIds: string[];
  presenterNote: PresenterNote;
  decisionIds?: string[];
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
