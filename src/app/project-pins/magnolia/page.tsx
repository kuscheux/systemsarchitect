import type { Metadata } from "next";
import { MagnoliaPresentationPlayer } from "./magnolia-presentation-player";

export const metadata: Metadata = {
  title: "Magnolia Landing Project Pin | 1CG",
  description:
    "A full-screen Project Pins presentation for Magnolia Landing's exterior envelope scope.",
};

export default function MagnoliaProjectPinPage() {
  return <MagnoliaPresentationPlayer />;
}
