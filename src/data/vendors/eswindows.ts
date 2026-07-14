import type { VendorProduct } from "@/data/pursuits/types";

export const esWindowsProducts: VendorProduct[] = [
  {
    id: "gw-7000",
    vendor: "eswindows",
    name: "GW-7000",
    category: "Impact-rated unitized curtain wall",
    summary:
      "A thermally broken, impact-rated curtain wall system configured for large-scale commercial installation and floor-by-floor delivery.",
    specs: [
      { label: "Frame Depth", value: "7 in." },
      { label: "Sight Line", value: "3.5 in." },
      { label: "Design Load", value: "+100 / -140 psf" },
      { label: "Water", value: "15 psf" },
      { label: "U-Value", value: "0.55" },
      { label: "STC", value: "43" },
    ],
    finishes: ["Anodized", "Painted", "Woodgrain"],
    sourceType: "deck",
  },
  {
    id: "es-7525",
    vendor: "eswindows",
    name: "ES-7525",
    category: "Stick curtain wall",
    summary:
      "A thermally improved stick curtain wall system with flexible glazing, corner, and entrance integration.",
    specs: [
      { label: "Frame Depth", value: "7.5 in." },
      { label: "Face", value: "2.5 in." },
      { label: "Design Load", value: "+100 / -100 psf" },
      { label: "Water", value: "20 psf" },
      { label: "U-Value", value: "0.31" },
    ],
    sourceType: "deck",
  },
  {
    id: "es-46t",
    vendor: "eswindows",
    name: "ES-46T",
    category: "Commercial entrance door",
    summary:
      "An impact-rated outswing entrance system with thermal break, multi-point lock options, and storefront compatibility.",
    specs: [
      { label: "Frame Depth", value: "4.5 in." },
      { label: "Design Load", value: "+100 / -120 psf" },
      { label: "Water", value: "15 psf" },
      { label: "Max Tested", value: "40 x 98 in." },
    ],
    sourceType: "deck",
  },
  {
    id: "es-9000",
    vendor: "eswindows",
    name: "ES-9000",
    category: "Impact entrance door",
    summary:
      "A preassembled impact door system with laminated glazing compatibility, stainless hardware, and ADA threshold options.",
    specs: [
      { label: "Frame Depth", value: "5 in." },
      { label: "Design Load", value: "+120 / -120 psf" },
      { label: "Water", value: "18 psf" },
      { label: "U-Value", value: "0.77" },
    ],
    sourceType: "deck",
  },
];
