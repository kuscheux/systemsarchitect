import Image from "next/image";
import type { PresentationAppearance } from "@/data/pursuits/types";

export function PursuitBrandLockup({ appearance = "dark" }: { appearance?: PresentationAppearance }) {
  const light = appearance === "light";
  return (
    <div className={`inline-flex h-11 items-center gap-3 border px-3 shadow-xl backdrop-blur-xl ${light ? "border-black/12 bg-white/82 text-black shadow-black/8" : "border-white/14 bg-black/38 text-white shadow-black/10"}`}>
      <Image
        src="/logo/1cg-line.svg"
        alt="1CG"
        width={650}
        height={389}
        className={`h-6 w-auto brightness-0 ${light ? "" : "invert"}`}
        priority
      />
      <span className="h-5 w-px bg-current opacity-18" aria-hidden="true" />
      <Image
        src="/logo/es-logo.svg"
        alt="ES"
        width={498}
        height={367}
        className="h-6 w-auto"
        priority
      />
    </div>
  );
}
