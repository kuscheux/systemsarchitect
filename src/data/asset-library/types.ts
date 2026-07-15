export type AssetLibraryVendorId =
  | "es"
  | "esmetals"
  | "lumabuilt"
  | "alucobond"
  | "saint-gobain";

export type AssetLibrarySource = {
  id: string;
  title: string;
  owner: string;
  kind: "vendor-page" | "vendor-document" | "project-deck" | "project-drawing";
  url?: string;
  localPath?: string;
  publishedAt?: string;
  retrievedAt: string;
  notes?: string;
};

export type ProductSpecification = {
  group: "Dimensions" | "Performance" | "Materials" | "Testing" | "Project Scope" | "Delivery";
  label: string;
  value: string;
  sourceId: string;
};

export type ProductAsset = {
  id: string;
  type: "photograph" | "drawing" | "datasheet" | "brochure" | "finish-swatch";
  title: string;
  alt: string;
  sourceId: string;
  url?: string;
  localPath?: string;
};

export type VendorFinish = {
  id: string;
  vendorId: AssetLibraryVendorId;
  name: string;
  family: "woodgrain" | "solid" | "metallic" | "custom";
  variation?: "V1" | "V2" | "V3";
  swatch?: string;
  notes?: string;
  sourceIds: string[];
};

export type AssetLibraryProduct = {
  id: string;
  vendorId: AssetLibraryVendorId;
  name: string;
  model?: string;
  category: string;
  summary: string;
  projectUse: string;
  features: string[];
  specifications: ProductSpecification[];
  finishIds: string[];
  assets: ProductAsset[];
  sourceIds: string[];
  verificationStatus: "verified" | "project-source" | "needs-confirmation";
  verificationNotes?: string[];
  verifiedAt: string;
};

export type AssetLibraryVendor = {
  id: AssetLibraryVendorId;
  name: string;
  website: string;
  summary: string;
};

export type MagnoliaSlideRecord = {
  slide: number;
  title: string;
  chapter: string;
  concept: string;
  extractedText: string[];
  productIds: string[];
  sourceIds: string[];
  assetIds: string[];
};
