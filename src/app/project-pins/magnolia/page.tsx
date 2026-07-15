import type { Metadata } from "next";
import { MagnoliaPresentationPlayer } from "./magnolia-presentation-player";

export const metadata: Metadata = {
  title: "Magnolia Landing Exterior Envelope | 1CG",
  description:
    "A full-screen presentation of Magnolia Landing's coordinated glazing, cladding, screening, logistics, and installation scope.",
};

export default function MagnoliaProjectPinPage() {
  return <MagnoliaPresentationPlayer />;
}
