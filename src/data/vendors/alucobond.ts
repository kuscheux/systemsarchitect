import type { VendorProduct } from "@/data/pursuits/types";

export const alucobondProducts: VendorProduct[] = [
  {
    id: "alucobond-charleston-green",
    vendor: "alucobond",
    name: "Alucobond 4mm ACM",
    category: "Aluminum composite material",
    summary:
      "A fabricated ACM package organized around one custom Charleston Green finish and a controlled panel schedule.",
    specs: [
      { label: "Installed Area", value: "34,273 SF" },
      { label: "Panel Count", value: "1,591 panels" },
      { label: "Material", value: "4mm ACM" },
      { label: "Finish", value: "Custom Charleston Green" },
    ],
    finishes: ["Custom 3-coat Charleston Green"],
    sourceType: "deck",
  },
];
