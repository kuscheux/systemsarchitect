import { AssetLibraryBrowser } from "@/components/portal/asset-library-browser";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import {
  assetLibraryProducts,
  assetLibrarySources,
  assetLibraryVendors,
  magnoliaSlideRecords,
  vendorFinishes,
} from "@/data/asset-library";

export default function PortalAssetLibraryPage() {
  return (
    <div className="grid gap-8">
      <PortalPageHeader
        eyebrow="Technical intelligence"
        title="Asset Library"
        description="Verified products, finishes, technical sources, and project-specific presentation content. Public brand labels use ES. Source-domain URLs remain visible only as citations."
      />
      <AssetLibraryBrowser
        vendors={assetLibraryVendors}
        products={assetLibraryProducts}
        finishes={vendorFinishes}
        sources={assetLibrarySources}
        slides={magnoliaSlideRecords}
      />
    </div>
  );
}
