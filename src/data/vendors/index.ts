import {
  assetLibraryProducts,
  assetLibrarySources,
  vendorFinishes,
} from "@/data/asset-library";
import type { VendorProduct } from "@/data/pursuits/types";

const finishNames = new Map(vendorFinishes.map((finish) => [finish.id, finish.name]));
const sources = new Map(assetLibrarySources.map((source) => [source.id, source]));

export const magnoliaVendorProducts: VendorProduct[] = assetLibraryProducts.map((product) => ({
  id: product.id,
  vendor: product.vendorId,
  name: product.name,
  category: product.category,
  summary: product.summary,
  specs: product.specifications.map((specification) => ({
    label: specification.label,
    value: specification.value,
  })),
  finishes: product.finishIds
    .map((finishId) => finishNames.get(finishId))
    .filter((finish): finish is string => Boolean(finish)),
  documents: product.assets
    .filter((asset) => asset.url && (asset.type === "datasheet" || asset.type === "brochure"))
    .map((asset) => ({ label: asset.title, url: asset.url as string })),
  sourceUrl: product.sourceIds
    .map((sourceId) => sources.get(sourceId)?.url)
    .find((url): url is string => Boolean(url)),
  sourceType: product.verificationStatus === "verified" ? "vendor" : "deck",
  verifiedAt: product.verifiedAt,
}));
