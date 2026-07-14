import { alucobondProducts } from "@/data/vendors/alucobond";
import { esMetalsProducts } from "@/data/vendors/esmetals";
import { esWindowsProducts } from "@/data/vendors/eswindows";
import { lumabuiltProducts } from "@/data/vendors/lumabuilt";

export const magnoliaVendorProducts = [
  ...esWindowsProducts,
  ...esMetalsProducts,
  ...lumabuiltProducts,
  ...alucobondProducts,
];
